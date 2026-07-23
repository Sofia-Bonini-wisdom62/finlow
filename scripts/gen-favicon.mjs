// Gera app/favicon.ico (32x32, antialiasado) com a logo do Finlow —
// F verde com seta de crescimento em quadrado navy arredondado.
// Mesma arte do app/icon.svg, rasterizada sem dependências.
// Uso: node scripts/gen-favicon.mjs
import { writeFileSync } from "fs"

const OUT = 32          // tamanho final
const SRC = 512         // espaço de coordenadas da arte (igual ao SVG)
const RAIO = 120        // cantos do quadrado
const SS = 4            // supersampling por eixo (16 amostras/pixel)

function hex(c) {
  return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]
}
const NAVY = hex("#0F1E33")
const VERDE_A = hex("#2BDBA8")
const VERDE_B = hex("#14B689")

// polígonos da arte (curvas do SVG aproximadas por chanfros — invisível em 32px)
const F_POLY = [
  [140, 420], [140, 150], [160, 110], [200, 96], [340, 96], [385, 108], [404, 150],
  [404, 205], [395, 224], [372, 232], [344, 232], [344, 172], [332, 161], [210, 161],
  [210, 258], [282, 258], [298, 270], [300, 284], [297, 300], [280, 310], [210, 310],
  [210, 350],
]
const SETA_POLY = [
  [183, 455], [305, 333], [282, 310], [390, 282], [362, 390], [339, 367], [217, 489],
]
const RISCO_POLY = [
  [203, 475], [293, 385], [327, 419], [237, 509],
]

function dentroPoligono(poly, x, y) {
  let dentro = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dentro = !dentro
  }
  return dentro
}

function dentroQuadrado(x, y) {
  const cx = x < RAIO ? RAIO : x > SRC - RAIO ? SRC - RAIO : x
  const cy = y < RAIO ? RAIO : y > SRC - RAIO ? SRC - RAIO : y
  const dx = x - cx
  const dy = y - cy
  return dx * dx + dy * dy <= RAIO * RAIO
}

// pixels BGRA, linhas de baixo pra cima (formato BMP)
const pixels = Buffer.alloc(OUT * OUT * 4)
const passo = SRC / OUT / SS

for (let py = 0; py < OUT; py++) {
  for (let px = 0; px < OUT; px++) {
    let nFundo = 0
    let nVerde = 0
    for (let sy = 0; sy < SS; sy++) {
      for (let sx = 0; sx < SS; sx++) {
        const x = (px * SS + sx + 0.5) * passo
        const y = (py * SS + sy + 0.5) * passo
        if (!dentroQuadrado(x, y)) continue
        nFundo++
        if (dentroPoligono(F_POLY, x, y) || dentroPoligono(SETA_POLY, x, y) || dentroPoligono(RISCO_POLY, x, y)) nVerde++
      }
    }
    const total = SS * SS
    const alpha = Math.round((nFundo / total) * 255)
    const i = ((OUT - 1 - py) * OUT + px) * 4
    if (alpha === 0) continue

    // gradiente diagonal do verde
    const t = (px + py) / (2 * (OUT - 1))
    const verde = VERDE_A.map((a, k) => Math.round(a + (VERDE_B[k] - VERDE_A[k]) * t))
    const fVerde = nFundo > 0 ? nVerde / nFundo : 0
    const [r, g, b] = NAVY.map((n, k) => Math.round(n + (verde[k] - n) * fVerde))

    pixels[i] = b
    pixels[i + 1] = g
    pixels[i + 2] = r
    pixels[i + 3] = alpha
  }
}

// BITMAPINFOHEADER (altura dobrada por causa da máscara AND)
const bmpHeader = Buffer.alloc(40)
bmpHeader.writeUInt32LE(40, 0)
bmpHeader.writeInt32LE(OUT, 4)
bmpHeader.writeInt32LE(OUT * 2, 8)
bmpHeader.writeUInt16LE(1, 12)
bmpHeader.writeUInt16LE(32, 14)

const andMask = Buffer.alloc(OUT * 4)
const imagem = Buffer.concat([bmpHeader, pixels, andMask])

const dir = Buffer.alloc(6)
dir.writeUInt16LE(1, 4)

const entry = Buffer.alloc(16)
entry[0] = OUT
entry[1] = OUT
entry.writeUInt16LE(1, 4)
entry.writeUInt16LE(32, 6)
entry.writeUInt32LE(imagem.length, 8)
entry.writeUInt32LE(6 + 16, 12)

writeFileSync("app/favicon.ico", Buffer.concat([dir, entry, imagem]))
console.log(`✓ app/favicon.ico gerado (${6 + 16 + imagem.length} bytes, ${OUT}x${OUT} com AA)`)
