// Converte um PNG 32x32 RGBA em app/favicon.ico (fallback p/ navegadores antigos).
// Os ícones principais (app/icon.png, app/apple-icon.png) são gerados a partir de
// assets/logo-nova.jpg — ver README do diretório assets.
// Uso: node scripts/png-para-ico.mjs app/icone32.png
import { readFileSync, writeFileSync } from "fs"
import zlib from "zlib"

const entrada = process.argv[2] ?? "app/icone32.png"
const buf = readFileSync(entrada)

// ---- decode PNG 8-bit RGBA sem interlace ----
if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("não é PNG")
const w = buf.readUInt32BE(16)
const h = buf.readUInt32BE(20)
if (buf[24] !== 8 || buf[25] !== 6 || buf[28] !== 0) throw new Error("esperado RGBA 8-bit sem interlace")

const idats = []
for (let p = 8; p < buf.length; ) {
  const len = buf.readUInt32BE(p)
  if (buf.toString("ascii", p + 4, p + 8) === "IDAT") idats.push(buf.subarray(p + 8, p + 8 + len))
  p += 12 + len
}
const raw = zlib.inflateSync(Buffer.concat(idats))

const stride = w * 4
const px = Buffer.alloc(w * h * 4)
const anterior = Buffer.alloc(stride)
for (let y = 0; y < h; y++) {
  const filtro = raw[y * (stride + 1)]
  const linha = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1))
  for (let i = 0; i < stride; i++) {
    const a = i >= 4 ? linha[i - 4] : 0
    const b = anterior[i]
    const c = i >= 4 ? anterior[i - 4] : 0
    let v = linha[i]
    if (filtro === 1) v = (v + a) & 255
    else if (filtro === 2) v = (v + b) & 255
    else if (filtro === 3) v = (v + ((a + b) >> 1)) & 255
    else if (filtro === 4) {
      const pp = a + b - c
      const pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c)
      v = (v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255
    }
    linha[i] = v
  }
  linha.copy(anterior)
  linha.copy(px, y * stride)
}

// ---- BMP dentro do container ICO (BGRA, linhas de baixo pra cima) ----
const bgra = Buffer.alloc(w * h * 4)
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const s = (y * w + x) * 4
    const d = ((h - 1 - y) * w + x) * 4
    bgra[d] = px[s + 2]
    bgra[d + 1] = px[s + 1]
    bgra[d + 2] = px[s]
    bgra[d + 3] = px[s + 3]
  }
}

const cabecalho = Buffer.alloc(40)
cabecalho.writeUInt32LE(40, 0)
cabecalho.writeInt32LE(w, 4)
cabecalho.writeInt32LE(h * 2, 8) // altura dobrada por causa da máscara AND
cabecalho.writeUInt16LE(1, 12)
cabecalho.writeUInt16LE(32, 14)

const imagem = Buffer.concat([cabecalho, bgra, Buffer.alloc(h * 4)])

const dir = Buffer.alloc(6)
dir.writeUInt16LE(1, 4)
const entry = Buffer.alloc(16)
entry[0] = w
entry[1] = h
entry.writeUInt16LE(1, 4)
entry.writeUInt16LE(32, 6)
entry.writeUInt32LE(imagem.length, 8)
entry.writeUInt32LE(22, 12)

writeFileSync("app/favicon.ico", Buffer.concat([dir, entry, imagem]))
console.log(`✓ app/favicon.ico (${w}x${h}) a partir de ${entrada}`)
