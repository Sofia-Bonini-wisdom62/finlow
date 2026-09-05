import { randomBytes, randomInt } from "node:crypto"

/**
 * Tudo o que se sabe sobre uma senha ANTES de haver banco: a régua do que é
 * uma senha aceitável, o sorteio de uma senha nova, e a leitura de que
 * caminho de recuperação uma conta tem.
 *
 * ── Por que este arquivo nasceu (30/08 → 05/09/2026) ────────────────────────
 * O backlog pediu recuperação de senha e o item trava numa decisão que não se
 * toma dentro do repositório: não existe envio de e-mail aqui, e escolher um
 * provedor traz domínio verificado, SPF/DKIM, custo por mensagem e credencial
 * de produção. Mesmo formato de bloqueio do conector Open Finance — e a mesma
 * saída: construir a metade que não depende da decisão.
 *
 * A metade que não depende é esta. Qual é o tamanho mínimo, o que fazer com
 * uma senha comprida demais, e sobretudo QUE CAMINHO cada conta tem de volta:
 * as três respostas valem igual com Resend, com SES ou sem provedor nenhum.
 *
 * ── A régua morava em três lugares ─────────────────────────────────────────
 * `POST /api/cadastro` tinha `senha.length < 6` escrito à mão, o sorteio de
 * senha da operação morava em lib/ops-escola.ts, e nada em lugar nenhum
 * classificava a conta. Três cópias de uma regra divergem no primeiro ajuste,
 * e a divergência de senha aparece do pior jeito possível: a pessoa cadastra
 * o que a tela aceitou e não consegue mais entrar.
 *
 * ── Onde ele NÃO pode ser importado ────────────────────────────────────────
 * Componente de cliente. Usa `node:crypto` para sortear, e o sorteio de
 * segredo é do servidor por definição. A ponta do navegador não precisa dele:
 * hoje nenhuma tela valida senha antes de mandar, e quem recusa é a rota.
 */

/**
 * O mínimo, e ele é o que sempre foi.
 *
 * Seis é curto para 2026, e subir é decisão de produto com custo real: toda
 * conta que já existe passaria a ter senha abaixo da régua, e uma régua que o
 * app não consegue exigir de quem já entrou é régua que só atrapalha quem
 * chega. Fica registrado como número afinável, num lugar só, para o dia em que
 * a fundadora quiser subir junto com um pedido de troca.
 */
export const MIN_SENHA = 6

/**
 * O teto, e ele não é escolha nossa: é do bcrypt.
 *
 * O algoritmo lê no máximo 72 BYTES e ignora o resto, em silêncio. Duas senhas
 * que só diferem depois do byte 72 são a MESMA senha para o `bcrypt.compare` —
 * quem escreve uma frase longa acha que tem uma senha enorme e tem 72 bytes.
 * Recusar é feio; aceitar e ignorar metade é pior, porque a pessoa nunca fica
 * sabendo.
 *
 * BYTES, não caracteres: "á" ocupa 2 e um emoji ocupa 4. Um teto de 72
 * caracteres deixaria passar 40 acentos (80 bytes) e voltaria a truncar.
 */
export const MAX_SENHA_BYTES = 72

export type LeituraDeSenha = { ok: true; senha: string } | { ok: false; motivo: string }

/** Bytes UTF-8, sem `Buffer`, para a função seguir sendo aritmética pura. */
function bytes(s: string): number {
  return new TextEncoder().encode(s).length
}

/**
 * A senha que a pessoa escolheu, conferida.
 *
 * NÃO apara espaço das pontas, e isso é decisão. Espaço é caractere de senha
 * como qualquer outro, e quem apara no cadastro tem de aparar no login também
 * — senão a conta nasce com uma senha que a própria tela de entrada não
 * consegue reproduzir. Aparar dos dois lados seria coerente e ainda assim
 * errado: apagaria em silêncio parte do que a pessoa digitou.
 *
 * O que é recusado é a senha só de espaço, que é o caso em que o descuido é
 * certeza e não escolha.
 */
export function lerSenha(bruta: unknown): LeituraDeSenha {
  if (typeof bruta !== "string" || bruta.length === 0) {
    return { ok: false, motivo: "Escolhe uma senha." }
  }
  if (bruta.trim().length === 0) {
    return { ok: false, motivo: "Essa senha é só espaço. Escreve alguma coisa." }
  }
  if (bruta.length < MIN_SENHA) {
    return { ok: false, motivo: `A senha precisa de pelo menos ${MIN_SENHA} caracteres.` }
  }
  if (bytes(bruta) > MAX_SENHA_BYTES) {
    return {
      ok: false,
      motivo:
        `Essa senha é comprida demais — o limite é ${MAX_SENHA_BYTES} bytes, e acento e ` +
        "emoji contam mais de um. Encurta um pouco.",
    }
  }
  return { ok: true, senha: bruta }
}

// ------------------------------------------------ o caminho de cada conta ---

/**
 * O login de aluno criado em lote termina em `.invalid`, domínio que a RFC
 * 2606 reserva para NUNCA resolver (lib/ops-escola.ts, decisão de 18/08/2026).
 *
 * `endsWith` e não `includes`: "nota.invalid@gmail.com" é um Gmail de verdade,
 * e tratá-lo como login de escola mandaria a pessoa falar com uma escola que
 * ela nunca viu. Minúsculas porque `User.email` é gravado normalizado, mas o
 * que chega de um formulário não é.
 */
export function ehLoginDeEscola(email: string): boolean {
  return email.trim().toLowerCase().endsWith(".invalid")
}

/**
 * Por onde ESTA conta volta, quando a pessoa esquece a senha.
 *
 * São os três casos que o backlog listou como decisões do item (30/08/2026), e
 * eles existem com ou sem provedor de e-mail escolhido:
 *
 *   "escola"  login `.invalid`: nenhuma mensagem chega ali, de propósito.
 *             Quem repõe a senha é a escola ou a operação — nunca um link.
 *   "google"  `User.senha` é null: a conta nasceu pelo botão do Google e NÃO
 *             TEM senha. Mandar link de "redefinir" seria oferecer trocar uma
 *             coisa que não existe.
 *   "senha"   o caso comum: e-mail de verdade e senha própria.
 *
 * `.invalid` vem antes de tudo porque vale mesmo que a conta tenha senha (ela
 * sempre tem: nasce com uma sorteada). O que decide ali é a impossibilidade de
 * entregar, não o que está gravado na coluna.
 *
 * ⚠️ Esta função classifica UMA conta que já se sabe existir. Ela não é, e não
 * pode virar, a resposta de um formulário público: dizer a um desconhecido
 * qual é o caminho de um e-mail é dizer que aquele e-mail tem conta no Finlow.
 * Num app de dinheiro isso é dado sensível sozinho, antes de qualquer número.
 */
export type CaminhoDeRecuperacao = "senha" | "google" | "escola"

export function caminhoDeRecuperacao(conta: { email: string; temSenha: boolean }): CaminhoDeRecuperacao {
  if (ehLoginDeEscola(conta.email)) return "escola"
  if (!conta.temSenha) return "google"
  return "senha"
}

// -------------------------------------------------------------- o sorteio ---

/** Alfabeto sem caractere ambíguo: quem digita a senha de aluno tem 7 anos. */
export const ALFABETO_SENHA = "abcdefghjkmnpqrstuvwxyz23456789"

export function senhaDeAluno(tamanho = 6): string {
  let s = ""
  for (let i = 0; i < tamanho; i++) s += ALFABETO_SENHA[randomInt(ALFABETO_SENHA.length)]
  return s
}

/** Senha temporária de adulto: 12 caracteres, quem digita tem gerenciador. */
export function senhaDeAdulto(): string {
  return randomBytes(9).toString("base64url")
}
