#!/usr/bin/env python3
"""Create the public anti-bot widget and local, untracked server secrets."""
from pathlib import Path
import subprocess,json,secrets,hashlib,os
root=Path(__file__).resolve().parent.parent
folder=root/'private'/'admin'
folder.mkdir(parents=True,exist_ok=True)
secretfile=folder/'worker-secrets.json'
if secretfile.exists():
    print('Existing community secrets retained.');raise SystemExit(0)
result=subprocess.run(['npx','wrangler','turnstile','widget','create','SGIA Community','--domain','onlyunlimit.github.io','--mode','managed','--json'],cwd=root/'backend',text=True,capture_output=True)
if result.returncode:
    raise SystemExit('Turnstile creation failed. No credential output was printed.')
try: widget=json.loads(result.stdout)
except ValueError: raise SystemExit('Unexpected Turnstile response; inspect securely before retrying.')
if isinstance(widget,dict) and 'result' in widget: widget=widget['result']
if not isinstance(widget,dict) or not widget.get('secret') or not widget.get('sitekey'):
    # Keep unexpected response privately to avoid creating a second widget.
    (folder/'turnstile-response.json').write_text(result.stdout)
    os.chmod(folder/'turnstile-response.json',0o600)
    raise SystemExit('Widget response saved privately; inspect its field names before continuing.')
key=secrets.token_urlsafe(48)
values={'ADMIN_KEY_HASH':hashlib.sha256(key.encode()).hexdigest(),'IP_KEY':secrets.token_urlsafe(48),'PASSWORD_PEPPER':secrets.token_urlsafe(48),'TURNSTILE_SECRET':widget['secret']}
secretfile.write_text(json.dumps(values));os.chmod(secretfile,0o600)
(folder/'access.txt').write_text('SGIA 관리자 전용 인증\n\n관리자 비밀 키 (공유 금지):\n'+key+'\n\n관리자 주소는 배포 후 이 파일에 추가됩니다.\n직원 체험 로그인과 별개입니다. 관리자 키를 분실하면 새로 발급해야 합니다.\n이 파일을 비밀번호 관리자에 안전하게 보관하세요.\n')
os.chmod(folder/'access.txt',0o600)
(root/'assets'/'service-config.js').write_text('// Public configuration only. Server secrets remain in Cloudflare.\nexport const serviceConfig='+json.dumps({'api':'','turnstileSiteKey':widget['sitekey']})+';\n')
print('Created anti-bot widget. Admin key and server secrets saved under private/admin (untracked).')
