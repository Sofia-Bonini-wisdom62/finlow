import Link from "next/link"
import type { Metadata } from "next"
import { EMAIL_CONTATO } from "@/lib/constantes"
import { LOGO_FIN } from "@/lib/fin"

export const metadata: Metadata = {
  title: "Esqueci minha senha · Finlow",
  description: "Como voltar para a sua conta do Finlow.",
}

/**
 * A página que diz a verdade sobre recuperação de senha.
 *
 * **Ela não tem formulário, e isso é a decisão principal.** Um campo de
 * e-mail aqui teria de responder alguma coisa, e as duas respostas possíveis
 * são ruins enquanto não há envio de e-mail no repositório: "enviamos o link"
 * é mentira, e "não achei essa conta" transforma a tela numa consulta pública
 * de quem usa o Finlow — que num app de dinheiro é dado sensível sozinho,
 * antes de qualquer número. Sem campo, não há nada a vazar nem a prometer.
 *
 * O que ela faz é encaminhar para o suporte, que hoje tem como responder: a
 * operação repõe a senha em /ops/contas. As duas metades entraram juntas de
 * propósito — esta tela sem aquela seria mandar a pessoa escrever para um
 * e-mail sem resposta possível.
 *
 * Os três caminhos estão na tela porque são três pessoas diferentes, e a mais
 * comum das três nem precisa de suporte: quem entrou pelo Google não esqueceu
 * senha nenhuma — nunca teve uma — e volta sozinha pelo botão do login.
 *
 * Quando o "esqueci minha senha" de verdade existir (falta escolher provedor
 * de envio: domínio verificado, SPF/DKIM, custo por mensagem), é esta tela
 * que ganha o formulário. Ver `docs/backlog-produto.md`, *Recuperação de
 * senha*.
 */
export default function RecuperarSenhaPage() {
  return (
    <main
      className="tema-fin flex min-h-dvh flex-col items-center justify-center px-6 py-10"
      style={{
        background:
          "radial-gradient(ellipse at top, color-mix(in srgb, var(--fin-accent) 7%, transparent), transparent 55%), var(--fin-bg)",
      }}
    >
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_FIN} alt="Finlow" className="size-[52px] rounded-xl" />
        </Link>

        <h1 className="mt-6 text-2xl font-black" style={{ color: "var(--fin-text)" }}>
          Esqueceu a senha?
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--fin-muted)" }}>
          Dá pra voltar. Ainda não é automático, então vai por aqui:
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Bloco titulo="Se você entrou com o Google">
            Você nunca teve senha aqui: sua conta abre pelo botão{" "}
            <strong style={{ color: "var(--fin-text)" }}>Entrar com Google</strong> na tela de
            login. Não precisa de mais nada.
          </Bloco>

          <Bloco titulo="Se você entrou com e-mail e senha">
            Escreve pra gente de dentro do{" "}
            <strong style={{ color: "var(--fin-text)" }}>seu próprio e-mail</strong>, o mesmo da
            conta, e a gente cria uma senha nova pra você. Costuma sair no mesmo dia.{" "}
            <a
              href={`mailto:${EMAIL_CONTATO}?subject=${encodeURIComponent("Esqueci minha senha")}`}
              className="font-extrabold"
              style={{ color: "var(--fin-accent)" }}
            >
              {EMAIL_CONTATO}
            </a>
          </Bloco>

          <Bloco titulo="Se você entrou pela sua escola">
            Quem repõe é a escola: fala com seu professor ou com a secretaria. O login da escola
            não recebe e-mail, então essa é a via.
          </Bloco>
        </div>

        <p className="mt-6 text-xs" style={{ color: "var(--fin-dim)" }}>
          Seus dados continuam onde estavam. Nada é apagado por esquecer a senha, e trocar a senha
          não mexe em lançamento, meta nem conversa.
        </p>

        <p className="mt-6 text-center text-sm" style={{ color: "var(--fin-muted)" }}>
          Lembrou?{" "}
          <Link href="/login" className="font-extrabold" style={{ color: "var(--fin-accent)" }}>
            Voltar pro login
          </Link>
        </p>
      </div>
    </main>
  )
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-[14px] border-[1.5px] px-4 py-3.5"
      style={{
        borderColor: "var(--fin-border-2)",
        background: "var(--fin-surface)",
      }}
    >
      <p className="text-sm font-extrabold" style={{ color: "var(--fin-text)" }}>
        {titulo}
      </p>
      <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--fin-muted)" }}>
        {children}
      </p>
    </div>
  )
}
