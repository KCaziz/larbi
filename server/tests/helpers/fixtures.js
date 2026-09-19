import zlib from 'node:zlib';

// Small REAL files (their content is what the server inspects, not their name).

const TABLE = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

// A valid, decodable PNG of the given size (a colour gradient).
export function makePng(width = 8, height = 8) {
  const row = width * 3 + 1;
  const raw = Buffer.alloc(row * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * row + 1 + x * 3;
      raw[i] = 20 + Math.floor((x / width) * 90);
      raw[i + 1] = 90 + Math.floor((y / height) * 100);
      raw[i + 2] = 150;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

export const PNG = makePng();
export const PDF = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n');
// Minimal MP4 container (an "ftyp" box): enough for content sniffing, not for playback.
export const MP4 = Buffer.concat([
  Buffer.from([0, 0, 0, 24]),
  Buffer.from('ftypisom'),
  Buffer.from([0, 0, 2, 0]),
  Buffer.from('isomiso2'),
  Buffer.alloc(2000, 7),
]);

// Hostile or invalid files: every one must be refused by content, whatever its name.
export const HOSTILE = {
  'text renamed to .png': { bytes: Buffer.from('just some text, not an image'), name: 'a.png', type: 'image/png' },
  'HTML renamed to .png': { bytes: Buffer.from('<html><script>alert(1)</script></html>'), name: 'a.png', type: 'image/png' },
  'SVG with a script': { bytes: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'), name: 'a.svg', type: 'image/svg+xml' },
  'Windows executable as .png': { bytes: Buffer.concat([Buffer.from('MZ'), Buffer.alloc(300, 1)]), name: 'a.png', type: 'image/png' },
  'ZIP renamed to .pdf': { bytes: Buffer.concat([Buffer.from([0x50, 0x4b, 3, 4]), Buffer.alloc(300, 1)]), name: 'a.pdf', type: 'application/pdf' },
  'PHP with an image content-type': { bytes: Buffer.from('<?php system($_GET["c"]); ?>'), name: 'shell.php.png', type: 'image/png' },
  'empty file': { bytes: Buffer.alloc(0), name: 'a.png', type: 'image/png' },
};

// A multipart body carrying one file in the field "file".
export function fileForm(bytes, { name = 'file.png', type = 'image/png', field = 'file' } = {}) {
  const form = new FormData();
  form.append(field, new Blob([bytes], { type }), name);
  return form;
}
