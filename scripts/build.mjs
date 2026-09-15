import { cp, mkdir, readdir, rm, lstat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));
// Explicit public entries. Never copy the repository root or raw Markdown.
export const publicEntries = ['index.html', 'portal.html', 'departments.html', 'origin.html', 'beacon.html', 'shield.html', 'entertainment.html', 'lucky.html', 'obsidus.html', 'orpe.html', 'records.html', 'headquarters.html', 'manual.html', 'community.html', 'monster.html', 'sgia.html', 'team.html',
  'bodam.html', 'quote.html', 'setlog.html', 'character', 'school', 'idcard', 'bgm', 'assets'];
const extensions = new Set(['.html', '.css', '.js', '.json', '.svg', '.webp', '.png', '.jpg', '.mp3', '.woff2']);
async function validate(dir) {
  const stat = await lstat(dir);
  if (stat.isSymbolicLink()) throw new Error(`Public symlinks are forbidden: ${dir}`);
  if (stat.isDirectory()) {
    for (const entry of await readdir(dir)) {
      if (entry.startsWith('.')) throw new Error(`Hidden public entry: ${entry}`);
      await validate(path.join(dir, entry));
    }
  } else if (!extensions.has(path.extname(dir))) throw new Error(`Unexpected public file: ${dir}`);
}
export async function build() {
  for (const entry of publicEntries) await validate(path.join(root, entry));
  const output = path.join(root, 'dist');
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  for (const entry of publicEntries) await cp(path.join(root, entry), path.join(output, entry), { recursive: true });
  console.log('onlyunlimit: public files built into dist/; private sources excluded.');
  return output;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) await build();
