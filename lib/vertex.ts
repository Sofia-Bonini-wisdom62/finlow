import { GoogleGenAI } from "@google/genai"

/**
 * Client da Vertex AI.
 *
 * ⚠️ SDK: a instrução pedia `@google-cloud/vertexai`, mas esse pacote se
 * declara depreciado desde 24/06/2025 e com remoção anunciada para
 * 24/06/2026 — data já passada. Ele ainda instala e roda, e imprime o aviso
 * de depreciação em toda inicialização. Usamos `@google/genai`, o substituto
 * oficial, apontando para o MESMO backend Vertex (`vertexai: true`). A razão
 * comercial da escolha na instrução — contrato GCP, dado fora de treino,
 * créditos de startup — continua valendo: muda o SDK, não o backend.
 *
 * Duas formas de credencial, porque os ambientes são diferentes:
 *  - Local: GOOGLE_APPLICATION_CREDENTIALS aponta para secrets/vertex-sa.json
 *    e o SDK acha o arquivo sozinho (ADC).
 *  - Vercel: não há filesystem persistente, então o JSON inteiro vem em
 *    GOOGLE_VERTEX_CREDENTIALS_JSON e o client é montado da string.
 *
 * O client nasce sob demanda, não no import: criado no topo do módulo, uma
 * rota que apenas importasse este arquivo quebraria no build sem as variáveis
 * — inclusive rota que não usa IA nenhuma.
 */

export class VertexNaoConfigurada extends Error {
  constructor(faltando: string[]) {
    super(`Vertex AI não configurada. Faltando: ${faltando.join(", ")}`)
    this.name = "VertexNaoConfigurada"
  }
}

function credenciais() {
  const json = process.env.GOOGLE_VERTEX_CREDENTIALS_JSON
  if (!json) return undefined // cai no ADC via GOOGLE_APPLICATION_CREDENTIALS
  try {
    return { credentials: JSON.parse(json) }
  } catch {
    throw new Error(
      "GOOGLE_VERTEX_CREDENTIALS_JSON não é JSON válido. Cole o conteúdo do arquivo da service account inteiro, numa linha só, sem aspas em volta."
    )
  }
}

let cache: GoogleGenAI | null = null

export function getVertex(): GoogleGenAI {
  if (cache) return cache

  const faltando: string[] = []
  if (!process.env.GOOGLE_VERTEX_PROJECT) faltando.push("GOOGLE_VERTEX_PROJECT")
  if (!process.env.GOOGLE_VERTEX_CREDENTIALS_JSON && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    faltando.push("GOOGLE_VERTEX_CREDENTIALS_JSON ou GOOGLE_APPLICATION_CREDENTIALS")
  }
  if (faltando.length) throw new VertexNaoConfigurada(faltando)

  const auth = credenciais()
  cache = new GoogleGenAI({
    vertexai: true,
    project: process.env.GOOGLE_VERTEX_PROJECT!,
    location: process.env.GOOGLE_VERTEX_LOCATION || "global",
    ...(auth ? { googleAuthOptions: auth } : {}),
  })
  return cache
}

export function vertexConfigurada(): boolean {
  try {
    getVertex()
    return true
  } catch {
    return false
  }
}

/**
 * Modelos sondados contra o projeto em 27/07/2026. `gemini-3-flash`, que a
 * instrução pedia, NÃO existe em nenhuma região. E os 3.x só são servidos em
 * `location: global` — us-central1 devolve 404 para eles.
 *
 * O parsing usa flash-lite porque o teste mostrou o contrário do esperado: no
 * extrato de referência os três modelos acertaram a soma, e o 2.5-pro (17s, o
 * mais caro) foi o PIOR em descricaoLimpa, deixando "NETFLIX.COM" cru onde o
 * flash-lite (3,5s) devolveu "Netflix". Quem protege a aritmética aqui é a
 * validação, não o tamanho do modelo.
 */
export const MODELO_PARSING = process.env.GEMINI_MODEL_PARSING || "gemini-3.1-flash-lite"
export const MODELO_CHAT = process.env.GEMINI_MODEL_CHAT || "gemini-3.1-flash-lite"
