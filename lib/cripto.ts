import { createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from "node:crypto"

/**
 * Criptografia de campo para os dados financeiros (AES-256-GCM).
 *
 * ── O que esta camada protege ──────────────────────────────────────────────
 * Vazamento do banco em repouso: dump, backup, réplica, credencial de leitura
 * vazada, acesso da infraestrutura do Supabase, exposição acidental por log ou
 * query mal configurada. Em todos esses casos o atacante vê apenas cifra.
 *
 * ── O que esta camada NÃO protege ──────────────────────────────────────────
 * Comprometimento do servidor da aplicação. A chave vive na variável de
 * ambiente do próprio processo, porque o app precisa decifrar para calcular
 * saldo, gráfico e contexto da IA. Quem executa código no servidor lê tudo.
 * Criptografia de ponta a ponta (chave derivada da senha do usuário) fecharia
 * essa porta, mas quebraria dois requisitos do produto: a IA não poderia ler
 * os números no servidor, e esquecer a senha significaria perder os dados.
 *
 * ── Ligação com o dono ─────────────────────────────────────────────────────
 * O GCM autentica dados adicionais (AAD). Usamos `userId:campo`, então uma
 * cifra do usuário A colada na linha do usuário B falha ao decifrar em vez de
 * revelar o valor errado como se fosse legítimo.
 *
 * ── Chave ──────────────────────────────────────────────────────────────────
 * ENCRYPTION_KEY = 32 bytes em base64. PERDER A CHAVE É PERDER OS DADOS: não
 * existe recuperação. Ela precisa estar no .env local e nas variáveis de
 * ambiente da Vercel, e ser tratada como segredo de produção.
 */

const PREFIXO = "v1"
const ALGORITMO = "aes-256-gcm"
const TAM_IV = 12 // recomendado para GCM
const TAM_TAG = 16

let cacheChave: Buffer | null = null

export class ChaveAusente extends Error {
  constructor() {
    super(
      "ENCRYPTION_KEY não configurada. Gere uma com: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\""
    )
    this.name = "ChaveAusente"
  }
}

let avisou = false

function chave(): Buffer {
  if (cacheChave) return cacheChave
  const bruta = process.env.ENCRYPTION_KEY
  if (!bruta) {
    // Sem isto, a ausência da chave chega como um 500 genérico em toda tela
    // financeira, e diagnosticar leva horas. Uma linha no log resolve.
    if (!avisou) {
      avisou = true
      console.error(
        "[cripto] ENCRYPTION_KEY ausente neste ambiente. Os dados financeiros " +
        "estão cifrados no banco e NÃO podem ser lidos sem ela. Se isto é " +
        "produção, configure a variável na Vercel. O valor tem de ser o mesmo " +
        "usado na migração."
      )
    }
    throw new ChaveAusente()
  }
  const buf = Buffer.from(bruta, "base64")
  if (buf.length !== 32) {
    throw new Error(`ENCRYPTION_KEY deve ter 32 bytes em base64 (tem ${buf.length}).`)
  }
  cacheChave = buf
  return buf
}

export function criptografiaConfigurada(): boolean {
  try {
    chave()
    return true
  } catch {
    return false
  }
}

/** Um valor já cifrado por esta lib começa com "v1." */
export function estaCifrado(v: unknown): boolean {
  return typeof v === "string" && v.startsWith(PREFIXO + ".")
}

export function cifrar(texto: string, userId: string, campo: string): string {
  const iv = randomBytes(TAM_IV)
  const c = createCipheriv(ALGORITMO, chave(), iv)
  c.setAAD(Buffer.from(`${userId}:${campo}`, "utf8"))
  const ct = Buffer.concat([c.update(texto, "utf8"), c.final()])
  const tag = c.getAuthTag()
  return [PREFIXO, iv.toString("base64url"), tag.toString("base64url"), ct.toString("base64url")].join(".")
}

/**
 * Decifra. Valor ainda em claro (pré-migração) é devolvido como veio — assim o
 * app continua servindo enquanto o backfill roda, em vez de quebrar no meio.
 */
export function decifrar(valor: string | null | undefined, userId: string, campo: string): string {
  if (valor === null || valor === undefined) return ""
  if (!estaCifrado(valor)) return valor

  const partes = valor.split(".")
  if (partes.length !== 4) throw new Error(`Formato de cifra inválido no campo ${campo}`)
  const [, ivB64, tagB64, ctB64] = partes

  const tag = Buffer.from(tagB64, "base64url")
  if (tag.length !== TAM_TAG) throw new Error(`Tag de autenticação inválida no campo ${campo}`)

  const d = createDecipheriv(ALGORITMO, chave(), Buffer.from(ivB64, "base64url"))
  d.setAAD(Buffer.from(`${userId}:${campo}`, "utf8"))
  d.setAuthTag(tag)
  // .final() lança se a autenticação falhar — cifra adulterada ou de outro dono
  return Buffer.concat([d.update(Buffer.from(ctB64, "base64url")), d.final()]).toString("utf8")
}

/** Número → cifra. Guardamos como texto porque a coluna deixou de ser numérica. */
export function cifrarNumero(n: number, userId: string, campo: string): string {
  return cifrar(String(n), userId, campo)
}

export function decifrarNumero(valor: string | null | undefined, userId: string, campo: string): number {
  const t = decifrar(valor, userId, campo)
  const n = parseFloat(t)
  return isFinite(n) ? n : 0
}

/** Comparação de segredos em tempo constante (usada nos testes da chave). */
export function iguaisSeguro(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}
