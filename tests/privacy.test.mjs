import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { build, root } from '../scripts/build.mjs';

test('Deployment contains only public assets, never original prompts or personal materials', async () => {
  const output=await build();
  async function walk(folder) {
    const files=[];
    for(const e of await readdir(folder,{withFileTypes:true})) {
      const p=path.join(folder,e.name);if(e.isDirectory())files.push(...await walk(p));else files.push(path.relative(output,p));
    }return files;
  }
  const files=await walk(output);
  assert.ok(files.includes('index.html'));
  for(const name of ['monster.html','sgia.html','team.html','assets/characters.js'])assert.ok(files.includes(name));
  assert.ok(files.every(f=>!/(caveduck\/|private\/|jy\.html|180899|KakaoTalk|\.md$|\.git)/i.test(f)));
  const ignore=await readFile(path.join(root,'.gitignore'),'utf8');
  assert.ok(ignore.includes('/caveduck/'));assert.ok(ignore.includes('/private/'));
  const workflow=await readFile(path.join(root,'.github/workflows/pages.yml'),'utf8');
  assert.ok(workflow.includes('path: dist'));assert.ok(workflow.includes('workflow_dispatch:'));assert.ok(!workflow.includes('push:'));
});
