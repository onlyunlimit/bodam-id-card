import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const catalogue=JSON.parse(await readFile(new URL('music-assets.json',root),'utf8'));
const expected=new Set(Object.values(catalogue).map(item=>item.path.slice('/audio/'.length)));
const actual=await readdir(new URL('.music-assets/audio/',root));
if(actual.length!==expected.size||actual.some(name=>!expected.has(name)))throw Error('Music asset directory must match the approved catalogue.');
for(const item of Object.values(catalogue)){
 const file=await readFile(new URL('.music-assets'+item.path,root));
 if(file.length!==item.bytes||!item.path.includes(createHash('sha256').update(file).digest('hex')))throw Error('Music asset integrity check failed.');
 if(file.subarray(0,3).toString()==='ID3')throw Error('Unexpected ID3 metadata.');
}
console.log(`Validated ${expected.size} playback assets.`);
