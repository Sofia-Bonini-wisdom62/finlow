// Processa a logo oficial (public/logo-original.png, RGB com fundo branco) e gera:
//   app/icon.png        512x512  (favicon moderno, fundo transparente)
//   app/apple-icon.png  180x180  (ícone de tela inicial no iPhone)
//   app/favicon.ico     32x32    (fallback navegadores antigos)
// Sem dependências: decodifica/encoda PNG na mão (zlib nativo do Node).
// Uso: node scripts/processar-logo.mjs
import { readFileSync, writeFileSync } from "fs"
import zlib from "zlib"

const ORIGEM = "public/logo-original.png"
const LIMIAR_BRANCO = 220 // acima disso (r,g,b) conta como fundo branco

// ---------- decode PNG (8-bit RGB/RGBA, sem interlace) ----------
function decodePNG(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("não é PNG")
  const w = buf.readUInt32BE(16)
  const h = buf.readUInt32BE(20)
  const colorType = buf[25]
  if (buf[24] !== 8 || buf[28] !== 0) throw new Error("só 8-bit sem interlace")
  const canais = colorType === 6 ? 4 : colorType === 2 ? 3 : null
  if (!canais) throw new Error(`colorType ${colorType} não suportado`)

  const idats = []
  for (let p = 8; p < buf.length; ) {
    const len = buf.readUInt32BE(p)
    const tipo = buf.toString("ascii", p + 4, p + 8)
    if (tipo === "IDAT") idats.push(buf.subarray(p + 8, p + 8 + len))
    p += 12 + len
  }
  const raw = zlib.inflateSync(Buffer.concat(idats))

  const stride = w * canais
  const px = Buffer.alloc(w * h * 4)
  const linhaAnterior = Buffer.alloc(stride)
  for (let y = 0; y < h; y++) {
    const filtro = raw[y * (stride + 1)]
    const linha = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1))
    for (let i = 0; i < stride; i++) {
      const a = i >= canais ? linha[i - canais] : 0
      const b = linhaAnterior[i]
      const c = i >= canais ? linhaAnterior[i - canais] : 0
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
    linha.copy(linhaAnterior)
    for (let x = 0; x < w; x++) {
      const s = x * canais
      const d = (y * w + x) * 4
      px[d] = linha[s]
      px[d + 1] = linha[s + 1]
      px[d + 2] = linha[s + 2]
      px[d + 3] = canais === 4 ? linha[s + 3] : 255
    }
  }
  return { w, h, px }
}

// ---------- encode PNG (RGBA) ----------
function encodePNG(w, h, px) {
  function chunk(tipo, dados) {
    const out = Buffer.alloc(8 + dados.length + 4)
    out.writeUInt32BE(dados.length, 0)
    out.write(tipo, 4, "ascii")
    dados.copy(out, 8)
    out.writeUInt32BE(Number(zlib.crc32(out.subarray(4, 8 + dados.length))), 8 + dados.length)
    return out
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8
  ihdr[9] = 6 // RGBA
  const raw = Buffer.alloc(h * (1 + w * 4))
  for (let y = 0; y < h; y++) {
    px.copy(raw, y * (1 + w * 4) + 1, y * w * 4, (y + 1) * w * 4)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ])
}

// ---------- pipeline ----------
const { w, h, px } = decodePNG(readFileSync(ORIGEM))
console.log(`origem: ${w}x${h}`)

// 1) flood fill a partir das bordas: branco conectado à borda vira transparente
const branco = (i) => px[i] > LIMIAR_BRANCO && px[i + 1] > LIMIAR_BRANCO && px[i + 2] > LIMIAR_BRANCO
const fila = []
const visitado = new Uint8Array(w * h)
for (let x = 0; x < w; x++) { fila.push(x, (h - 1) * w + x) }
for (let y = 0; y < h; y++) { fila.push(y * w, y * w + w - 1) }
while (fila.length) {
  const p = fila.pop()
  if (visitado[p]) continue
  visitado[p] = 1
  if (!branco(p * 4)) continue
  px[p * 4 + 3] = 0
  const x = p % w, y = (p / w) | 0
  if (x > 0) fila.push(p - 1)
  if (x < w - 1) fila.push(p + 1)
  if (y > 0) fila.push(p - w)
  if (y < h - 1) fila.push(p + w)
}

// 2) recorta a caixa do conteúdo
let minX = w, minY = h, maxX = 0, maxY = 0
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    if (px[(y * w + x) * 4 + 3] > 0) {
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
}
const cw = maxX - minX + 1
const ch = maxY - minY + 1
console.log(`conteúdo: ${cw}x${ch} (recorte de ${minX},${minY})`)

// 3) redimensiona (média com alpha pré-multiplicado) pra um quadrado destino
function redimensionar(tam) {
  const out = Buffer.alloc(tam * tam * 4)
  const lado = Math.max(cw, ch)
  for (let dy = 0; dy < tam; dy++) {
    for (let dx = 0; dx < tam; dx++) {
      const x0 = minX + (dx * lado) / tam
      const x1 = minX + ((dx + 1) * lado) / tam
      const y0 = minY + (dy * lado) / tam
      const y1 = minY + ((dy + 1) * lado) / tam
      let r = 0, g = 0, b = 0, a = 0, n = 0
      for (let sy = Math.floor(y0); sy < Math.ceil(y1); sy++) {
        for (let sx = Math.floor(x0); sx < Math.ceil(x1); sx++) {
          n++
          if (sx > maxX || sy > maxY || sx >= w || sy >= h) continue
          const i = (sy * w + sx) * 4
          const alpha = px[i + 3] / 255
          r += px[i] * alpha
          g += px[i + 1] * alpha
          b += px[i + 2] * alpha
          a += alpha
        }
      }
      const d = (dy * tam + dx) * 4
      if (a > 0) {
        out[d] = Math.round(r / a)
        out[d + 1] = Math.round(g / a)
        out[d + 2] = Math.round(b / a)
        out[d + 3] = Math.round((a / n) * 255)
      }
    }
  }
  return out
}

writeFileSync("app/icon.png", encodePNG(512, 512, redimensionar(512)))
console.log("✓ app/icon.png (512x512)")
writeFileSync("app/apple-icon.png", encodePNG(180, 180, redimensionar(180)))
console.log("✓ app/apple-icon.png (180x180)")

// 4) favicon.ico: BMP 32x32 dentro do container ICO
const px32 = redimensionar(32)
const bgra = Buffer.alloc(32 * 32 * 4)
for (let y = 0; y < 32; y++) {
  for (let x = 0; x < 32; x++) {
    const s = (y * 32 + x) * 4
    const d = ((31 - y) * 32 + x) * 4
    bgra[d] = px32[s + 2]
    bgra[d + 1] = px32[s + 1]
    bgra[d + 2] = px32[s]
    bgra[d + 3] = px32[s + 3]
  }
}
const bmpHeader = Buffer.alloc(40)
bmpHeader.writeUInt32LE(40, 0)
bmpHeader.writeInt32LE(32, 4)
bmpHeader.writeInt32LE(64, 8)
bmpHeader.writeUInt16LE(1, 12)
bmpHeader.writeUInt16LE(32, 14)
const imagem = Buffer.concat([bmpHeader, bgra, Buffer.alloc(32 * 4)])
const dir = Buffer.alloc(6)
dir.writeUInt16LE(1, 4)
const entry = Buffer.alloc(16)
entry[0] = 32
entry[1] = 32
entry.writeUInt16LE(1, 4)
entry.writeUInt16LE(32, 6)
entry.writeUInt32LE(imagem.length, 8)
entry.writeUInt32LE(22, 12)
writeFileSync("app/favicon.ico", Buffer.concat([dir, entry, imagem]))
console.log("✓ app/favicon.ico (32x32)")
