import test from 'node:test';
import assert from 'node:assert/strict';
import {stripMetadata,imageURL} from '../image-privacy.js';

const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aSp0AAAAASUVORK5CYII=','base64');
test('PNG text, EXIF, unknown chunks and trailing bytes are removed',()=>{
 const text=Buffer.from('private GPS prompt'),chunk=Buffer.alloc(12+text.length);chunk.writeUInt32BE(text.length);chunk.write('tEXt',4);text.copy(chunk,8);
 const input=Buffer.concat([png.subarray(0,33),chunk,png.subarray(33),Buffer.from('secret trailing data')]);
 assert.deepEqual(Buffer.from(stripMetadata(input).bytes),png);
 assert.throws(()=>stripMetadata(png.subarray(0,40)));
});
test('JPEG APP metadata and comments are removed, scans preserved and trailing data dropped',()=>{
 const input=Uint8Array.from([255,216,255,225,0,5,71,80,83,255,254,0,4,65,66,255,218,0,2,1,2,255,0,4,255,217,99]);
 assert.deepEqual([...stripMetadata(input).bytes],[255,216,255,218,0,2,1,2,255,0,4,255,217]);
 assert.throws(()=>stripMetadata(input.slice(0,8)));
});
test('WebP EXIF chunks removed and RIFF length repaired',()=>{
 const original=Buffer.from('UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA','base64');const extra=Buffer.from('EXIF\x04\0\0\0GPS!','binary');const input=Buffer.concat([original,extra]);input.writeUInt32LE(input.length-8,4);
 const cleaned=stripMetadata(input);assert.equal(cleaned.mime,'image/webp');assert.equal(Buffer.from(cleaned.bytes).includes(Buffer.from('GPS!')),false);assert.equal(new DataView(cleaned.bytes.buffer).getUint32(4,true),cleaned.bytes.length-8);
});
test('URL validation rejects credentials, private literal targets and executable content',()=>{
 for(const url of ['http://example.com/a','https://user:pass@example.com/a','https://127.0.0.1/a','https://[::1]/a','https://localhost/a','https://foo.internal/a'])assert.throws(()=>imageURL(url));
 assert.throws(()=>stripMetadata(Buffer.from('<svg><script>secret</script></svg>')));
 assert.match(imageURL('https://cdn.caveduck.io/cdn-cgi/image/f=auto,w=500/charim/a'),/metadata=none/);
});
