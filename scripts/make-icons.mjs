// Genera le icone PNG della PWA senza dipendenze (solo zlib di Node).
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

const BG = [27, 22, 38]
const GOLD = [242, 193, 78]
const FIRE = [228, 87, 46]
const CREAM = [246, 239, 224]

function crc32(buf) {
  let c, crc = 0xffffffff
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    crc = (crc >>> 8) ^ c
  }
  return (crc ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}
function png(size, pixel) {
  const raw = Buffer.alloc((size * 3 + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixel(x / size, y / size)
      const o = y * (size * 3 + 1) + 1 + x * 3
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 2
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0)),
  ])
}

// Boccetta alchemica; "scale" riduce il disegno per la zona sicura delle icone maskable.
function flask(scale) {
  return (u, v) => {
    const x = (u - 0.5) / scale + 0.5
    const y = (v - 0.5) / scale + 0.5
    const neck = x > 0.42 && x < 0.58 && y > 0.17 && y < 0.42
    const rim = x > 0.37 && x < 0.63 && y > 0.14 && y < 0.2
    // corpo: trapezio che si allarga verso il basso
    const t = (y - 0.4) / 0.45
    const half = 0.08 + t * 0.27
    const body = y >= 0.4 && y < 0.85 && Math.abs(x - 0.5) < half
    const liquid = body && y > 0.64
    if (rim) return CREAM
    if (liquid) return FIRE
    if (neck || body) return GOLD
    return BG
  }
}
for (const [name, size, scale] of [
  ['icon-192.png', 192, 1], ['icon-512.png', 512, 1], ['icon-maskable-512.png', 512, 0.72],
]) {
  writeFileSync(new URL(`../public/${name}`, import.meta.url), png(size, flask(scale)))
}
console.log('Icone generate in public/')
