/**
 * Os tetos de tentativa das portas PÚBLICAS da conta — entrar e criar conta —,
 * num arquivo só.
 *
 * ── Por que existe, e por que agora ────────────────────────────────────────
 * Saiu da primeira metade de *Recuperação de senha* (backlog, 30/08/2026). A
 * decisão 5 daquele item diz que a rota de reset é alvo clássico de abuso e
 * que o teto de requisições hoje cobre só o lead B2B. Ao conferir, a lacuna
 * era maior e mais antiga que o item: **as duas portas que já existem também
 * não tinham teto nenhum**. Num app de dinheiro, adivinhar senha à vontade é
 * defeito de hoje, não preparo para amanhã — e o reset, quando nascer, entra
 * nesta mesma casa em vez de inventar a terceira contagem.
 *
 * ── O que cada teto guarda ─────────────────────────────────────────────────
 * `LOGIN_POR_EMAIL` guarda UMA conta: é o teto que impede varrer senhas contra
 * a vítima escolhida. `LOGIN_POR_IP` guarda o resto: é o que impede varrer uma
 * senha comum contra MUITAS contas (o ataque inverso, que passa pelo primeiro
 * teto sem encostar nele, porque nenhuma conta chega a dez tentativas).
 * `CADASTRO_POR_IP` guarda o formulário de criar conta, que responde "esse
 * email já tem conta" e portanto é a consulta pública de quem usa o Finlow.
 *
 * ── Os números, e o que eles custam a quem não é atacante ──────────────────
 * Folgados de propósito: quem erra a senha erra três, quatro vezes, não dez.
 * O teto por IP é o triplo do teto por e-mail porque casa, escola e escritório
 * saem por um endereço só — apertá-lo tranca a sala de aula inteira quando um
 * aluno erra. E `null` de IP DESLIGA a regra por IP em vez de juntar todo
 * mundo numa chave "anon": bucket compartilhado num teto de login não é
 * atrito, é queda geral no primeiro proxy que esconder o cabeçalho.
 *
 * Folha de propósito (nada de next-auth, prisma ou next/server): quem importa
 * é `lib/auth.ts`, e um script de teste precisa conseguir carregar as regras
 * sem arrastar meio framework atrás.
 */

export interface Teto {
  max: number
  janelaMs: number
}

const MINUTO = 60 * 1000

/** Falhas seguidas contra a MESMA conta antes de a porta esfriar. */
export const LOGIN_POR_EMAIL: Teto = { max: 10, janelaMs: 15 * MINUTO }

/** Falhas seguidas vindas do MESMO endereço, contra qualquer conta. */
export const LOGIN_POR_IP: Teto = { max: 30, janelaMs: 15 * MINUTO }

/** Cadastros tentados do mesmo endereço — inclui o "esse email já tem conta". */
export const CADASTRO_POR_IP: Teto = { max: 10, janelaMs: 60 * MINUTO }

/**
 * O endereço de quem chamou, ou `null` quando não dá para saber.
 *
 * `null` não é "0.0.0.0" nem "anon" de propósito: ver o comentário do topo.
 * Quem recebe `null` deve PULAR a regra por IP e confiar na regra por conta,
 * que não depende de cabeçalho nenhum.
 *
 * Aceita qualquer coisa com `.get` (Headers do fetch, NextRequest.headers)
 * para o chamador não precisar saber de que framework veio a request.
 */
export function ipDaRequisicao(
  headers: { get(nome: string): string | null } | null | undefined
): string | null {
  if (!headers) return null
  // O primeiro da lista é o cliente; o resto são os proxies pelo caminho.
  const encadeado = headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  if (encadeado) return encadeado
  const direto = headers.get("x-real-ip")?.trim()
  return direto || null
}

/**
 * As chaves são prefixadas por porta porque o mapa do limitador é UM só: sem
 * o prefixo, a tentativa de login de `ana@x.com` e o cadastro do mesmo IP
 * disputariam a mesma contagem.
 */
export function chaveLoginEmail(email: string): string {
  return `login-email:${email.trim().toLowerCase()}`
}

export function chaveLoginIp(ip: string): string {
  return `login-ip:${ip}`
}

export function chaveCadastroIp(ip: string): string {
  return `cadastro-ip:${ip}`
}
