#!/usr/bin/env python3
"""Publish the checked public build to the dedicated GitHub Pages repository.

Uses the existing Git credential helper; credentials are never written or printed.
Default is read-only. Run with --publish after testing and committing the source.
"""
import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
OWNER = 'onlyunlimit'
REPO = 'onlyunlimit.github.io'
REMOTE = f'https://github.com/{OWNER}/{REPO}.git'
MARKER = '.sgia-release.json'


def command(args, cwd=ROOT, capture=False):
    return subprocess.run(args, cwd=cwd, check=True, text=True,
                          stdout=subprocess.PIPE if capture else None,
                          stderr=subprocess.PIPE if capture else None,
                          env={**os.environ, 'GIT_TERMINAL_PROMPT': '0'})


def credential():
    result = subprocess.run(['git', 'credential', 'fill'], cwd=ROOT,
                            input='protocol=https\nhost=github.com\n\n',
                            capture_output=True, text=True, timeout=25,
                            env={**os.environ, 'GIT_TERMINAL_PROMPT': '0'})
    fields = dict(line.split('=', 1) for line in result.stdout.splitlines() if '=' in line)
    if not fields.get('password'):
        raise RuntimeError('GitHub authentication is required. Sign in through your Git credential manager.')
    return fields['password']


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--publish', action='store_true', help='Create/update the public site and enable Pages')
    args = parser.parse_args()
    token = credential()

    def api(endpoint, method='GET', data=None, missing_ok=False):
        request = urllib.request.Request(
            'https://api.github.com/' + endpoint, method=method,
            data=None if data is None else json.dumps(data).encode(),
            headers={'Authorization': 'Bearer ' + token,
                     'Accept': 'application/vnd.github+json',
                     'Content-Type': 'application/json', 'User-Agent': 'onlyunlimit-SGIA-publisher'})
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                body = response.read()
                return json.loads(body) if body else {}
        except urllib.error.HTTPError as error:
            if missing_ok and error.code == 404:
                return None
            # Do not print request headers, credentials, or the credential-helper output.
            raise RuntimeError(f'GitHub {method} {endpoint}: HTTP {error.code}') from None

    user = api('user')
    if user.get('login', '').lower() != OWNER:
        raise RuntimeError('Authenticated account does not match the site owner.')
    target = api(f'repos/{OWNER}/{REPO}', missing_ok=True)
    if not args.publish:
        pages = api(f'repos/{OWNER}/{REPO}/pages', missing_ok=True) if target else None
        print(json.dumps({'repository': target.get('full_name') if target else None,
                          'pages_url': pages.get('html_url') if pages else None,
                          'status': pages.get('status') if pages else None}, ensure_ascii=False))
        return

    if command(['git', 'status', '--porcelain'], capture=True).stdout.strip():
        raise RuntimeError('Commit source changes before publishing so the release identifies an exact revision.')
    command(['npm', 'run', 'build'])
    output = ROOT / 'dist'
    files = [p.relative_to(output).as_posix() for p in output.rglob('*') if p.is_file()]
    for name in files:
        if name.startswith(('private/', 'caveduck/', '.git/')) or name.endswith('.md'):
            raise RuntimeError('Private material found in the build.')
    revision = command(['git', 'rev-parse', 'HEAD'], capture=True).stdout.strip()
    author = command(['git', 'config', 'user.name'], capture=True).stdout.strip()
    email = command(['git', 'config', 'user.email'], capture=True).stdout.strip()

    if target is None:
        target = api('user/repos', 'POST', {'name': REPO, 'private': False,
                     'description': 'SGIA — onlyunlimit world archive. Public build only.', 'auto_init': False})
        print('Created dedicated public site repository:', target['full_name'])

    with tempfile.TemporaryDirectory(prefix='sgia-pages-') as directory:
        checkout = Path(directory) / 'site'
        command(['git', 'clone', REMOTE, str(checkout)])
        marker = checkout / MARKER
        tracked = command(['git', 'ls-files'], cwd=checkout, capture=True).stdout.strip()
        if tracked and not marker.is_file():
            raise RuntimeError('The destination contains an unrelated site; refusing to replace it.')
        if marker.is_file():
            previous = json.loads(marker.read_text())
            if previous.get('project') != 'onlyunlimit-sgia':
                raise RuntimeError('The destination is not an SGIA release repository.')
            for name in previous.get('files', []):
                relative = Path(name)
                if relative.is_absolute() or '..' in relative.parts or '.git' in relative.parts:
                    raise RuntimeError('Invalid path in previous release manifest.')
                path = checkout / relative
                if path.is_symlink():
                    raise RuntimeError('Symlinks are not supported in published releases.')
                if path.is_file():
                    path.unlink()
        if not tracked:
            command(['git', 'checkout', '-b', 'main'], cwd=checkout)
        elif command(['git', 'branch', '--show-current'], cwd=checkout, capture=True).stdout.strip() != 'main':
            raise RuntimeError('Unexpected site default branch; inspect before publishing.')
        for name in files:
            destination = checkout / name
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(output / name, destination)
        (checkout / '.nojekyll').write_text('')
        marker.write_text(json.dumps({'project': 'onlyunlimit-sgia', 'source_revision': revision,
                                     'files': sorted(files + ['.nojekyll'])}, indent=2) + '\n')
        command(['git', 'add', '--all'], cwd=checkout)
        if command(['git', 'diff', '--cached', '--name-only'], cwd=checkout, capture=True).stdout.strip():
            command(['git', '-c', f'user.name={author}', '-c', f'user.email={email}', 'commit',
                     '-m', f'Publish SGIA site from {revision[:8]}'], cwd=checkout)
            command(['git', 'push', '-u', 'origin', 'main'], cwd=checkout)
    pages = api(f'repos/{OWNER}/{REPO}/pages', missing_ok=True)
    desired = {'build_type': 'legacy', 'source': {'branch': 'main', 'path': '/'}}
    if pages is None:
        api(f'repos/{OWNER}/{REPO}/pages', 'POST', desired)
    elif pages.get('source') != desired['source'] or pages.get('build_type') != 'legacy':
        api(f'repos/{OWNER}/{REPO}/pages', 'PUT', desired)
    print('Published public build. GitHub Pages build pending:', f'https://{REPO}/')


if __name__ == '__main__':
    try:
        main()
    except (RuntimeError, subprocess.CalledProcessError, subprocess.TimeoutExpired) as error:
        raise SystemExit(str(error))
