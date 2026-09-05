import Link from "next/link"
import { EMAIL_CONTATO } from "@/lib/constantes"
import { LOGO_FIN } from "@/lib/fin"

export const metadata = { title: "Esqueci minha senha · Finlow" }

/**
 * A porta que faltava — e ela diz a verdade sobre o que existe hoje.
 *
 * Até 05/09/2026 não havia NADA: nem link em /login, nem rota, nem caminho de
 * suporte dentro do produto. Quem esquecia a senha ficava olhando o formulário
 * e ia embora achando que tinha perdido o histórico financeiro, os objetivos,
 * a trilha e as conversas — que é exatamente o que teria acontecido.
 *
 * ── Por que esta tela não tem formulário ───────────────────────────────────
 * Um campo de e-mail com "enviaremos um link" seria mentira: não existe envio
 * de e-mail neste repositório, e escolher provedor é decisão com contrato,
 * custo e credencial de produção (backlog, *Recuperação de senha*, 30/08).
 * Prometer o link e não mandar nada é a mesma falha do passo 1 da landing, que
 * vendia conexão automática de banco — e aqui seria pior, porque a pessoa
 * ficaria esperando na caixa de entrada em vez de escrever para alguém.
 *
 * ── Por que ela explica os três casos em vez de perguntar o e-mail ─────────
 * Porque a resposta não pode revelar quem tem conta. Um formulário que
 * responde diferente para e-mail cadastrado e não cadastrado vira consulta
 * pública de "fulano usa o Finlow?", e num app de dinheiro isso é dado
 * sensível sozinho, antes de qualquer número. Uma página que descreve os três
 * caminhos não confirma nada sobre ninguém: a pessoa se reconhece sozinha.
 *
 * Os três casos são os do backlog: conta com senha, conta do Google (que não
 * tem senha nenhuma para redefinir) e login de escola terminado em `.invalid`,
 * que nunca recebe mensagem — para esse, quem repõe é a escola.
 */
export default function EsqueciSenhaPage() {
  const assunto = encodeURIComponent("Esqueci minha senha do Finlow")

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
          Dá pra voltar pra sua conta. Ainda não é automático — a gente destrava pra você.
        </p>

        <div
          className="mt-6 rounded-2xl border p-4"
          style={{
            borderColor: "var(--fin-border-2)",
            background: "var(--fin-surface)",
          }}
        >
          <p className="text-sm font-extrabold" style={{ color: "var(--fin-text)" }}>
            Escreve pra gente
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--fin-muted)" }}>
            Manda um e-mail <strong>do endereço que você usa pra entrar</strong>. A gente confere e
            devolve uma senha nova, que você troca depois em Menu &rsaquo; Conta.
          </p>
          <a
            href={`mailto:${EMAIL_CONTATO}?subject=${assunto}`}
            className="fin-btn-3d mt-4 block w-full rounded-2xl py-3.5 text-center text-sm font-extrabold"
            style={{ background: "var(--fin-accent)", color: "var(--fin-bg)" }}
          >
            Falar com o suporte
          </a>
          <p className="mt-2 text-center text-xs" style={{ color: "var(--fin-dim)" }}>
            {EMAIL_CONTATO}
          </p>
        </div>

        <div className="mt-5 space-y-3 text-sm" style={{ color: "var(--fin-muted)" }}>
          <p>
            <strong style={{ color: "var(--fin-text)" }}>Entrou com o Google?</strong> Então você
            não tem senha aqui — nunca teve. Volta pro login e usa o botão do Google.
          </p>
          <p>
            <strong style={{ color: "var(--fin-text)" }}>Seu login termina em .invalid?</strong>{" "}
            Essa conta foi criada pela sua escola, e é a escola que repõe a senha. Fala com o
            professor ou com a secretaria.
          </p>
        </div>

        <p className="mt-6 text-xs" style={{ color: "var(--fin-dim)" }}>
          Por que não tem link automático: o Finlow ainda não manda e-mail. Está no plano, e
          enquanto não está, preferimos te dizer isso a te deixar esperando uma mensagem que não
          ia chegar. Seus dados continuam inteiros — nada se perde enquanto a conta espera.
        </p>

        <p className="mt-6 text-center text-sm" style={{ color: "var(--fin-muted)" }}>
          <Link href="/login" className="font-extrabold" style={{ color: "var(--fin-accent)" }}>
            Voltar pro login
          </Link>
        </p>
      </div>
    </main>
  )
}
