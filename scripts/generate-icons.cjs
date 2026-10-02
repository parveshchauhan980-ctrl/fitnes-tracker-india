const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal pure Node PNG generator (zero external dependencies)
function createPNG(width, height, getPixel) {
  // getPixel(x, y) returns [r, g, b, a]
  const rowLength = 1 + width * 4; // 1 filter byte + RGBA pixels
  const rawBuffer = Buffer.alloc(height * rowLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawBuffer[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawBuffer[pxOffset] = r;
      rawBuffer[pxOffset + 1] = g;
      rawBuffer[pxOffset + 2] = b;
      rawBuffer[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawBuffer);

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: 6 (RGBA)
  ihdrData[10] = 0; // Compression: 0
  ihdrData[11] = 0; // Filter: 0
  ihdrData[12] = 0; // Interlace: 0
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT chunk
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// Standard PNG CRC32 table
let crcTable = null;
function getCrcTable() {
  if (crcTable) return crcTable;
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  crcTable = table;
  return table;
}

function crc32(buf) {
  const table = getCrcTable();
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Icon design: Dark background (#0f172a), emerald circular gradient (#10b981 / #06b6d4), dumbbell center
function renderIconPixel(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxR = w * (isMaskable ? 0.48 : 0.44);

  // Background
  let r = 15, g = 23, b = 42, a = 255; // #0f172a

  // Subtle circular gradient
  if (dist < maxR) {
    const factor = 1 - (dist / maxR);
    r = Math.min(255, Math.floor(15 + factor * 25));
    g = Math.min(255, Math.floor(23 + factor * 70));
    b = Math.min(255, Math.floor(42 + factor * 50));
  }

  // Thin outer cyan/emerald ring
  if (Math.abs(dist - maxR * 0.9) < w * 0.015) {
    return [16, 185, 129, 255]; // #10b981
  }

  // Dumbbell drawing in normalized coordinates (-1 to 1)
  const scale = isMaskable ? 0.6 : 0.65;
  const nx = (dx / (w * 0.5)) / scale;
  const ny = (dy / (h * 0.5)) / scale;

  // Center bar: nx in [-0.7, 0.7], ny in [-0.12, 0.12]
  if (Math.abs(nx) <= 0.75 && Math.abs(ny) <= 0.14) {
    return [16, 185, 129, 255]; // Emerald
  }

  // Center grip: nx in [-0.25, 0.25], ny in [-0.18, 0.18]
  if (Math.abs(nx) <= 0.25 && Math.abs(ny) <= 0.2) {
    return [255, 255, 255, 255]; // White grip
  }

  // Left large weight: nx in [-0.85, -0.65], ny in [-0.55, 0.55]
  if (nx >= -0.85 && nx <= -0.65 && Math.abs(ny) <= 0.55) {
    return [16, 185, 129, 255];
  }

  // Left outer small weight: nx in [-0.98, -0.85], ny in [-0.4, 0.4]
  if (nx >= -0.98 && nx < -0.85 && Math.abs(ny) <= 0.4) {
    return [52, 211, 153, 255]; // lighter emerald
  }

  // Right large weight: nx in [0.65, 0.85], ny in [-0.55, 0.55]
  if (nx >= 0.65 && nx <= 0.85 && Math.abs(ny) <= 0.55) {
    return [16, 185, 129, 255];
  }

  // Right outer small weight: nx in [0.85, 0.98], ny in [-0.4, 0.4]
  if (nx > 0.85 && nx <= 0.98 && Math.abs(ny) <= 0.4) {
    return [52, 211, 153, 255];
  }

  return [r, g, b, a];
}

// Target directory
const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA icons...');
const png192 = createPNG(192, 192, (x, y, w, h) => renderIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);

const png512 = createPNG(512, 512, (x, y, w, h) => renderIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);

const pngMaskable = createPNG(512, 512, (x, y, w, h) => renderIconPixel(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pngMaskable);

const appleIcon = createPNG(180, 180, (x, y, w, h) => renderIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);

const favicon = createPNG(64, 64, (x, y, w, h) => renderIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favicon);

console.log('Successfully generated all PWA icons in /public:');
console.log('- pwa-192x192.png');
console.log('- pwa-512x512.png');
console.log('- pwa-maskable-512x512.png');
console.log('- apple-touch-icon.png');
console.log('- favicon.ico');
