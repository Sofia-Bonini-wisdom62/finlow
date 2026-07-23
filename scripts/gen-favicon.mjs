// Gera app/favicon.ico (32x32) com a marca do Finlow — F escuro em quadrado
// verde arredondado. ICO com BMP sem compressão, sem dependências.
// Uso: node scripts/gen-favicon.mjs
import { writeFileSync } from "fs"

const S = 32
const RAIO = 9 // cantos arredondados (18/64 * 32)

function hex(c) {
  return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]
}
const VERDE_A = hex("#00C896")
const VERDE_B = hex("#00a37c")
const ESCURO = hex("#0D1B2A")

function dentroQuadradoArredondado(x, y) {
  const cx = x < RAIO ? RAIO : x > S - 1 - RAIO ? S - 1 - RAIO : x
  const cy = y < RAIO ? RAIO : y > S - 1 - RAIO ? S - 1 - RAIO : y
  const dx = x - cx
  const dy = y - cy
  return dx * dx + dy * dy <= RAIO * RAIO
}

// geometria do F na caixa 64 dividida por 2
const F_RECTS = [
  [11, 7.5, 4.5, 17],   // haste
  [11, 7.5, 11.5, 4.5], // braço de cima
  [11, 15, 9, 4],       // braço do meio
]

function dentroF(x, y) {
  return F_RECTS.some(([rx, ry, rw, rh]) => x >= rx && x < rx + rw && y >= ry && y < ry + rh)
}

// pixels BGRA, linhas de baixo pra cima (formato BMP)
const pixels = Buffer.alloc(S * S * 4)
for (let y = 0; y < S; y++) {
  for (let x = 0; x < S; x++) {
    const i = ((S - 1 - y) * S + x) * 4
    if (!dentroQuadradoArredondado(x, y)) {
      pixels[i + 3] = 0 // transparente
      continue
    }
    let [r, g, b] = ESCURO
    if (!dentroF(x, y)) {
      const t = (x + y) / (2 * (S - 1)) // gradiente diagonal
      r = Math.round(VERDE_A[0] + (VERDE_B[0] - VERDE_A[0]) * t)
      g = Math.round(VERDE_A[1] + (VERDE_B[1] - VERDE_A[1]) * t)
      b = Math.round(VERDE_A[2] + (VERDE_B[2] - VERDE_A[2]) * t)
    }
    pixels[i] = b
    pixels[i + 1] = g
    pixels[i + 2] = r
    pixels[i + 3] = 255
  }
}

// BITMAPINFOHEADER (altura dobrada por causa da máscara AND)
const bmpHeader = Buffer.alloc(40)
bmpHeader.writeUInt32LE(40, 0)
bmpHeader.writeInt32LE(S, 4)
bmpHeader.writeInt32LE(S * 2, 8)
bmpHeader.writeUInt16LE(1, 12)
bmpHeader.writeUInt16LE(32, 14)

const andMask = Buffer.alloc(S * 4) // 32 linhas × 4 bytes, zerada (alpha manda)

const imagem = Buffer.concat([bmpHeader, pixels, andMask])

const dir = Buffer.alloc(6)
dir.writeUInt16LE(1, 4) // 1 imagem

const entry = Buffer.alloc(16)
entry[0] = S
entry[1] = S
entry.writeUInt16LE(1, 4)
entry.writeUInt16LE(32, 6)
entry.writeUInt32LE(imagem.length, 8)
entry.writeUInt32LE(6 + 16, 12)

writeFileSync("app/favicon.ico", Buffer.concat([dir, entry, imagem]))
console.log(`✓ app/favicon.ico gerado (${6 + 16 + imagem.length} bytes)`)
