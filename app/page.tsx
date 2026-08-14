import { WaitlistForm } from "@/components/landing/WaitlistForm"
import { Faq } from "@/components/landing/Faq"
import { Reveal } from "@/components/landing/Reveal"
import { POSE, LOGO_FIN } from "@/lib/fin"

/**
 * A landing na identidade Fin (protótipo v2 da fundadora, 14/08/2026).
 *
 * A ESTRUTURA e a copy são as de antes — decisão dela: "gosto de como a nossa
 * está, mas eu quero a identidade visual". O que mudou: navy + dourado +
 * Nunito (via .tema-fin), o Fin no lugar dos mockups de celular (que exibiam
 * o produto na identidade antiga), botões 3D, e o card do Finlow para
 * Escolas antes do rodapé. O passo 1 do "Como funciona" também: o protótipo
 * corrigiu a promessa de conexão automática (item 2 da avaliação de UX) para
 * o que o produto FAZ — subir o extrato.
 */

function LogoMarca({ tamanho = 30 }: { tamanho?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_FIN}
      alt="Finlow"
      width={tamanho}
      height={tamanho}
      className="shrink-0 rounded-[22%]"
      style={{ width: tamanho, height: tamanho }}
    />
  )
}

/** Rótulo de seção: a vozinha dourada em caps que abre cada bloco. */
function Rotulo({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 text-[13px] font-extrabold uppercase tracking-[1.4px]" style={{ color: "var(--fin-accent)" }}>
      {children}
    </div>
  )
}

export default function LandingPage() {
  return (
    <div
      className="tema-fin overflow-x-hidden [font-variant-numeric:tabular-nums]"
      style={{ background: "var(--fin-bg)", color: "var(--fin-text)" }}
    >

      {/* ============ NAV ============ */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-[14px]"
        style={{
          borderColor: "var(--fin-border)",
          background: "color-mix(in srgb, var(--fin-bg) 84%, transparent)",
        }}
      >
        <nav className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-5 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2.5">
            <LogoMarca />
            <span className="text-[19px] font-black tracking-tight">finlow</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-7">
            <div className="hidden gap-7 text-[14.5px] font-bold lg:flex" style={{ color: "var(--fin-muted)" }}>
              <a href="#problema" className="transition-colors hover:text-[var(--fin-accent)]">O problema</a>
              <a href="#recursos" className="transition-colors hover:text-[var(--fin-accent)]">Recursos</a>
              <a href="#como" className="transition-colors hover:text-[var(--fin-accent)]">Como funciona</a>
              <a href="#faq" className="transition-colors hover:text-[var(--fin-accent)]">Dúvidas</a>
              <a href="/empresas" className="transition-colors hover:text-[var(--fin-accent)]">Para empresas</a>
            </div>
            {/* A porta. Quem já tem conta entra por "Entrar"; quem não tem cria uma. */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <a
                href="/login"
                className="flex min-h-11 items-center rounded-full border-[1.5px] px-4 text-sm font-extrabold transition-colors sm:text-[14px]"
                style={{ borderColor: "var(--fin-border-2)", color: "var(--fin-text)" }}
              >
                Entrar
              </a>
              <a
                href="/cadastro"
                className="fin-btn-3d flex min-h-11 items-center rounded-xl px-4 text-sm font-extrabold sm:px-5 sm:text-[14px]"
                style={{ background: "var(--fin-accent)", color: "var(--fin-bg)" }}
              >
                Criar conta
              </a>
            </div>
          </div>
        </nav>

        {/* navegação de seções no mobile — o menu do desktop fica escondido aqui */}
        <div className="flex gap-1 overflow-x-auto border-t px-3 pb-1.5 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden" style={{ borderColor: "var(--fin-border)" }}>
          {[
            ["#problema", "O problema"],
            ["#recursos", "Recursos"],
            ["#como", "Como funciona"],
            ["#faq", "Dúvidas"],
            ["/empresas", "Para empresas"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="shrink-0 whitespace-nowrap rounded-lg px-2.5 py-2.5 text-[13.5px] font-bold"
              style={{ color: "var(--fin-muted)" }}
            >
              {label}
            </a>
          ))}
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-5 pb-10 pt-14 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:gap-14 lg:pt-20">
        <Reveal className="relative">
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full border-[1.5px] px-3.5 py-[7px] text-[11.5px] font-black uppercase tracking-[.8px]"
            style={{ background: "var(--fin-surface)", borderColor: "var(--fin-border-2)", color: "var(--fin-accent)" }}
          >
            <span className="fin-wob h-[7px] w-[7px] rounded-full" style={{ background: "var(--fin-acerto)" }} />
            Já no ar · em desenvolvimento ativo
          </div>
          <h1 className="mb-5 text-balance text-[40px] font-black leading-[1.04] tracking-[-.03em] sm:text-5xl lg:text-[56px]">
            Seu dinheiro,<br />enfim <span style={{ color: "var(--fin-accent)" }}>claro.</span>
          </h1>
          <p className="mb-8 max-w-[500px] text-pretty text-[17px] leading-[1.55] sm:text-[19.5px]" style={{ color: "var(--fin-muted)" }}>
            O Finlow transforma a bagunça das suas finanças em clareza, com inteligência artificial
            que lê seus gastos, revela padrões que você não vê e te devolve o controle.{" "}
            <strong className="font-extrabold" style={{ color: "var(--fin-text)" }}>Sem planilha, sem julgamento, sem esforço.</strong>
          </p>
          <div className="mb-6 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3.5">
            <a
              href="/cadastro"
              className="fin-btn-3d rounded-2xl px-7 py-4 text-center text-base font-extrabold"
              style={{ background: "var(--fin-accent)", color: "var(--fin-bg)" }}
            >
              Criar conta grátis →
            </a>
            <a
              href="#como"
              className="rounded-2xl border-[1.5px] px-6 py-[15px] text-center text-base font-extrabold transition-colors"
              style={{ borderColor: "var(--fin-border-2)", color: "var(--fin-text)" }}
            >
              Ver como funciona
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[13.5px]" style={{ color: "var(--fin-muted)" }}>
            <div className="flex items-center gap-2"><span className="font-black" style={{ color: "var(--fin-acerto)" }}>✓</span> Grátis para começar</div>
            <div className="hidden h-4 w-px sm:block" style={{ background: "var(--fin-border-2)" }} />
            <div className="flex items-center gap-2"><span className="font-black" style={{ color: "var(--fin-acerto)" }}>✓</span> Cancele quando quiser</div>
          </div>
          <p className="mt-5 text-[14.5px]" style={{ color: "var(--fin-muted)" }}>
            Já tem conta?{" "}
            <a href="/login" className="font-extrabold underline underline-offset-4" style={{ color: "var(--fin-accent)" }}>
              Entrar
            </a>
          </p>
        </Reveal>

        {/* O Fin no lugar do mockup: o mascote é a identidade — e o mockup
            mostrava o produto na cara antiga. */}
        <Reveal className="relative flex justify-center">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-8"
            style={{ background: "radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--fin-accent) 14%, transparent) 0%, transparent 65%)" }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={POSE.hi2}
            alt="Fin, o mascote do Finlow, acenando"
            className="fin-floaty relative h-[260px] object-contain sm:h-[320px] lg:h-[380px]"
          />
        </Reveal>
      </section>

      {/* ============ TRUST STRIP ============ */}
      <section className="mx-auto max-w-[1200px] px-5 pb-14 pt-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3.5 text-[13.5px] font-bold" style={{ color: "var(--fin-dim)" }}>
          <span className="font-extrabold" style={{ color: "var(--fin-muted)" }}>Construído sobre 3 princípios:</span>
          <span className="flex items-center gap-2"><span style={{ color: "var(--fin-accent)" }}>◆</span> Clareza antes de estímulo</span>
          <span className="flex items-center gap-2"><span style={{ color: "var(--fin-accent)" }}>◆</span> Zero julgamento</span>
          <span className="flex items-center gap-2"><span style={{ color: "var(--fin-accent)" }}>◆</span> Seus dados, seu controle</span>
        </div>
      </section>

      {/* ============ PROBLEMA ============ */}
      <section id="problema" className="px-5 py-16 sm:px-6 lg:py-22" style={{ background: "var(--fin-surface-2)" }}>
        <Reveal className="mx-auto max-w-[1000px] text-center">
          <Rotulo>Você conhece essa sensação</Rotulo>
          <h2 className="mx-auto mb-5 max-w-[760px] text-balance text-[32px] font-black leading-[1.12] tracking-[-.025em] lg:text-[40px]">
            O problema nunca foi falta de dinheiro. Foi falta de <span style={{ color: "var(--fin-accent)" }}>clareza.</span>
          </h2>
          <p className="mx-auto mb-12 max-w-[620px] text-[16px] leading-[1.55] sm:text-lg" style={{ color: "var(--fin-muted)" }}>
            Abrir o extrato dá um aperto. Você sabe que gasta demais em algum lugar, só não sabe onde.
            E toda vez que tenta organizar numa planilha, desiste na segunda semana.
          </p>
          <div className="grid gap-5 text-left sm:grid-cols-2 lg:grid-cols-3">
            {[
              { e: "😮‍💨", t: "Extrato confuso", d: "Dezenas de transações sem nome que faça sentido. Cadê o padrão?" },
              { e: "🧾", t: "Planilha abandonada", d: "Muito trabalho manual. Você nunca mantém por mais que alguns dias." },
              { e: "🌀", t: "Decisão no escuro", d: "Dá pra viajar esse mês? Cabe essa parcela? Você chuta, e torce." },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl p-6" style={{ background: "var(--fin-surface)" }}>
                <div className="mb-3 text-[26px]">{c.e}</div>
                <div className="mb-1.5 text-base font-black">{c.t}</div>
                <div className="text-sm leading-relaxed" style={{ color: "var(--fin-muted)" }}>{c.d}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ============ RECURSOS ============ */}
      <section id="recursos" className="mx-auto max-w-[1200px] px-5 pb-10 pt-16 sm:px-6 lg:pt-24">
        <Reveal className="mx-auto mb-14 max-w-[720px] text-center">
          <Rotulo>A virada de chave</Rotulo>
          <h2 className="mb-4 text-balance text-[32px] font-black leading-[1.1] tracking-[-.03em] lg:text-[42px]">
            A IA faz o trabalho pesado. Você fica só com a clareza.
          </h2>
          <p className="text-[16px] leading-[1.55] sm:text-lg" style={{ color: "var(--fin-muted)" }}>
            O Finlow lê, categoriza e interpreta cada movimento, e traduz tudo em uma frase que você entende de primeira.
          </p>
        </Reveal>
        <Reveal className="grid gap-5 md:grid-cols-3">
          {[
            { pose: POSE.idea, t: "Insights que fazem sentido", d: "Nada de gráfico solto. A IA aponta exatamente onde seu dinheiro vaza e o que muda se você ajustar, em linguagem humana." },
            { pose: POSE.point, t: "Converse com seu dinheiro", d: "\"Posso gastar R$ 300 esse fim de semana?\" Pergunte em português. O Finlow responde com base nos seus números reais." },
            { pose: POSE.determined, t: "Controle de verdade", d: "Metas, orçamentos e alertas calmos, que avisam antes, não depois. Você decide com dados, não com culpa." },
          ].map((c) => (
            <div key={c.t} className="rounded-[20px] border p-7" style={{ borderColor: "var(--fin-border-2)", background: "var(--fin-surface)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.pose} alt="" className="mb-4 h-14 object-contain" />
              <h3 className="mb-2.5 text-xl font-black tracking-tight">{c.t}</h3>
              <p className="text-[15px] leading-relaxed" style={{ color: "var(--fin-muted)" }}>{c.d}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ============ SPLIT 1 — CHAT ============ */}
      <section className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-14 sm:px-6 lg:grid-cols-[.95fr_1.05fr] lg:gap-16 lg:py-[70px]">
        <Reveal className="order-2 flex justify-center lg:order-1">
          {/* A conversa de exemplo, como o protótipo desenha: bolha dourada da
              pessoa, o Fin respondendo, e a barra do orçamento embaixo. */}
          <div className="flex w-full max-w-[400px] flex-col gap-3 rounded-[22px] p-5" style={{ background: "var(--fin-surface)" }}>
            <div
              className="max-w-[82%] self-end rounded-[16px_16px_4px_16px] px-3.5 py-2.5 text-[13.5px] font-bold leading-[1.45]"
              style={{ background: "var(--fin-accent)", color: "var(--fin-bg)" }}
            >
              Posso gastar R$ 300 no rolê esse fim de semana?
            </div>
            <div className="flex max-w-[92%] items-end gap-2 self-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={POSE.cheer} alt="" className="h-8 w-8 shrink-0 object-contain" />
              <div
                className="rounded-[16px_16px_16px_4px] border-[1.5px] px-3.5 py-3 text-[13.5px] leading-[1.5]"
                style={{ background: "var(--fin-surface-2)", borderColor: "var(--fin-border-2)" }}
              >
                Pode sim! Você tem <strong style={{ color: "var(--fin-accent)" }}>R$ 640 livres</strong> no
                orçamento de lazer este mês. Gastando R$ 300, ainda fica dentro do plano.
              </div>
            </div>
            <div className="rounded-2xl border-[1.5px] p-3.5 text-[13px]" style={{ borderColor: "var(--fin-border-2)", background: "var(--fin-surface-2)" }}>
              <div className="mb-2 text-[11px] font-extrabold" style={{ color: "var(--fin-muted)" }}>Lazer · este mês</div>
              <div className="mb-1.5 h-2 overflow-hidden rounded-full" style={{ background: "var(--fin-border)" }}>
                <div className="h-full w-[53%] rounded-full" style={{ background: "var(--fin-accent)" }} />
              </div>
              <div className="flex justify-between text-[11px]" style={{ color: "var(--fin-muted)" }}>
                <span>R$ 360 usados</span><span className="font-black" style={{ color: "var(--fin-text)" }}>R$ 640 livres</span>
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal className="order-1 lg:order-2">
          <Rotulo>Assistente financeiro</Rotulo>
          <h2 className="mb-4 text-balance text-[30px] font-black leading-[1.12] tracking-[-.03em] lg:text-[38px]">
            Tire dúvidas de dinheiro como quem manda mensagem
          </h2>
          <p className="mb-7 max-w-[520px] text-[16px] leading-relaxed sm:text-[17.5px]" style={{ color: "var(--fin-muted)" }}>
            Chega de abrir cinco telas pra entender uma coisa. Pergunte em linguagem natural e receba uma
            resposta direta. Baseada nos seus dados, não em conselho genérico da internet.
          </p>
          <div className="flex flex-col gap-4">
            {[
              ["Respostas com contexto real", ". Cruza saldo, metas e histórico antes de responder."],
              ["Sem jargão", ", se usar um termo técnico, ele explica na hora."],
              ["Sempre calmo", ". Nunca te faz sentir mal por uma pergunta."],
            ].map(([forte, resto]) => (
              <div key={forte} className="flex items-start gap-3">
                <span className="text-lg font-black" style={{ color: "var(--fin-acerto)" }}>✓</span>
                <span className="text-base leading-relaxed"><strong>{forte}</strong>{resto}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ============ SPLIT 2 — INSIGHTS ============ */}
      <section className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-14 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:py-[70px]">
        <Reveal>
          <Rotulo>Insights automáticos</Rotulo>
          <h2 className="mb-4 text-balance text-[30px] font-black leading-[1.12] tracking-[-.03em] lg:text-[38px]">
            Ele percebe o que você não teria tempo de notar
          </h2>
          <p className="mb-7 max-w-[520px] text-[16px] leading-relaxed sm:text-[17.5px]" style={{ color: "var(--fin-muted)" }}>
            Enquanto você vive sua vida, a IA cruza cada transação e faz emergir os padrões silenciosos —
            a assinatura esquecida, o gasto que dobrou, o mês em que sempre estoura.
          </p>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="rounded-[14px] p-5" style={{ background: "var(--fin-surface)" }}>
              <div className="text-[28px] font-black tracking-[-.02em]" style={{ color: "var(--fin-accent)" }}>R$ 214</div>
              <div className="mt-1 text-[13px]" style={{ color: "var(--fin-muted)" }}>em assinaturas esquecidas, detectadas no 1º mês*</div>
            </div>
            <div className="rounded-[14px] p-5" style={{ background: "var(--fin-surface)" }}>
              <div className="text-[28px] font-black tracking-[-.02em]" style={{ color: "var(--fin-accent)" }}>0 min</div>
              <div className="mt-1 text-[13px]" style={{ color: "var(--fin-muted)" }}>de digitação manual, categorização é automática</div>
            </div>
          </div>
          <p className="mt-3.5 text-[11.5px]" style={{ color: "var(--fin-dim)" }}>*Estimativa de projeto em desenvolvimento, sujeita a validação.</p>
        </Reveal>
        <Reveal className="flex justify-center">
          {/* Os três insights, nos tons do jogo: atenção, descoberta, no caminho. */}
          <div className="flex w-full max-w-[400px] flex-col gap-3">
            <div className="rounded-[14px] border-l-[3px] p-4" style={{ background: "var(--fin-surface)", borderColor: "var(--fin-combo)" }}>
              <div className="mb-1.5 text-[11px] font-black uppercase tracking-[.5px]" style={{ color: "var(--fin-combo)" }}>⚑ Atenção</div>
              <div className="text-[13.5px] leading-[1.5]">Seu gasto com <strong>delivery</strong> subiu <strong>38%</strong> este mês. São R$ 480. O equivalente a 2 semanas do seu mercado.</div>
            </div>
            <div className="rounded-[14px] border-l-[3px] p-4" style={{ background: "var(--fin-surface)", borderColor: "var(--fin-accent)" }}>
              <div className="mb-1.5 text-[11px] font-black uppercase tracking-[.5px]" style={{ color: "var(--fin-accent)" }}>◆ Descoberta</div>
              <div className="text-[13.5px] leading-[1.5]">Você paga <strong>2 apps de streaming</strong> quase iguais. Cancelar um economiza R$ 39,90/mês.</div>
            </div>
            <div className="rounded-[14px] border-l-[3px] p-4" style={{ background: "var(--fin-surface)", borderColor: "var(--fin-acerto)" }}>
              <div className="mb-1.5 text-[11px] font-black uppercase tracking-[.5px]" style={{ color: "var(--fin-acerto)" }}>✓ No caminho</div>
              <div className="text-[13.5px] leading-[1.5]">No ritmo atual, sua <strong>reserva de emergência</strong> chega à meta em 3 meses.</div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============ COMO FUNCIONA ============ */}
      <section id="como" className="px-5 py-16 sm:px-6 lg:py-24" style={{ background: "var(--fin-surface-2)" }}>
        <div className="mx-auto max-w-[1100px]">
          <Reveal className="mx-auto mb-14 max-w-[680px] text-center">
            <Rotulo>Como funciona</Rotulo>
            <h2 className="text-balance text-[32px] font-black leading-[1.1] tracking-[-.03em] lg:text-[40px]">
              Da bagunça à clareza em três passos
            </h2>
          </Reveal>
          {/* O passo 1 dizia "Conecte suas contas — suas transações entram
              sozinhas, nada de digitar CSV". Isso é Open Finance, que está no
              backlog e não existe: a entrada de dados real é o extrato que a
              pessoa exporta do banco. O app logado já dizia a verdade
              ("Bancos conectados · Em breve", em Ajustes) enquanto a home
              vendia o recurso como pronto. */}
          <Reveal className="grid gap-7 md:grid-cols-3">
            {[
              // O passo 1 diz o que o produto FAZ (o protótipo corrigiu a
              // promessa de conexão automática — Open Finance segue no backlog).
              { n: "1", t: "Suba seu extrato", d: "O PDF do banco, lido em segundos, direto no seu aparelho. Sem digitar nada." },
              { n: "2", t: "A IA organiza tudo", d: "Categoriza, encontra padrões e limpa o ruído. Em minutos, o caos vira um painel legível." },
              { n: "3", t: "Você decide com clareza", d: "Insights, metas e um assistente pronto para responder. Cada decisão apoiada em dados reais." },
            ].map((p) => (
              <div key={p.n}>
                <div
                  className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl text-[19px] font-black"
                  style={{ background: "var(--fin-accent)", color: "var(--fin-bg)", boxShadow: "0 4px 0 var(--fin-accent-sombra)" }}
                >
                  {p.n}
                </div>
                <h3 className="mb-2.5 text-xl font-black">{p.t}</h3>
                <p className="text-[15px] leading-relaxed" style={{ color: "var(--fin-muted)" }}>{p.d}</p>
              </div>
            ))}
          </Reveal>
          <Reveal className="mx-auto mt-12 max-w-[680px] rounded-2xl bg-fl-dark-surface px-6 py-5 text-center">
            <p className="text-[14.5px] leading-relaxed text-fl-dark-text">
              <strong className="font-semibold text-white">E a conexão automática com o banco?</strong>{" "}
              Está no plano (Open Finance), mas ainda não existe. Hoje a entrada de dados é o
              extrato que você exporta — e é ele que alimenta tudo que você viu acima.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ DIFERENCIAL ============ */}
      <section className="mx-auto max-w-[1000px] px-5 pb-14 pt-16 sm:px-6 lg:pt-24">
        <Reveal className="mx-auto mb-12 max-w-[680px] text-center">
          <Rotulo>Por que Finlow</Rotulo>
          <h2 className="text-balance text-[32px] font-black leading-[1.1] tracking-[-.03em] lg:text-[40px]">
            Feito para dar alívio, não mais uma cobrança
          </h2>
        </Reveal>
        <Reveal className="grid gap-5 md:grid-cols-2">
          <div className="rounded-[20px] border p-7" style={{ borderColor: "var(--fin-border-2)", background: "var(--fin-surface)" }}>
            <div className="mb-4 text-[13px] font-black uppercase tracking-[.6px]" style={{ color: "var(--fin-dim)" }}>Os outros apps</div>
            <div className="flex flex-col gap-3.5 text-[15px]" style={{ color: "var(--fin-muted)" }}>
              {[
                "Gráficos que você precisa interpretar sozinho",
                "Categorização manual e cansativa",
                "Cores alarmantes e notificações de culpa",
                "Feito para quem já entende de finanças",
              ].map((t) => (
                <div key={t} className="flex gap-2.5"><span className="font-black" style={{ color: "var(--fin-erro)" }}>✕</span> {t}</div>
              ))}
            </div>
          </div>
          {/* O card dourado com sombra 3D — a assinatura visual do protótipo. */}
          <div className="rounded-[20px] p-7" style={{ background: "var(--fin-accent)", color: "var(--fin-bg)", boxShadow: "0 4px 0 var(--fin-accent-sombra)" }}>
            <div className="mb-4 text-[13px] font-black uppercase tracking-[.6px] opacity-70">Com o Finlow</div>
            <div className="flex flex-col gap-3.5 text-[15px] font-bold">
              {[
                "A IA interpreta e te diz o que importa",
                "Tudo categorizado automaticamente",
                "Tom calmo, sem alarme, sem julgamento",
                "Feito para quem nunca aprendeu do assunto",
              ].map((t) => (
                <div key={t} className="flex gap-2.5"><span className="font-black">✓</span> {t}</div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============ CRIAR CONTA (+ novidades por e-mail) ============ */}
      <section id="lista" className="px-5 pb-24 pt-10 sm:px-6">
        <Reveal className="relative mx-auto max-w-[820px] overflow-hidden rounded-[28px] px-6 py-14 text-center sm:px-12 sm:py-16 bg-[var(--fin-surface)]">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-20 h-[260px] w-[260px] rounded-full"
            style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--fin-accent) 20%, transparent) 0%, transparent 70%)" }}
          />
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={POSE.flex} alt="" className="mx-auto mb-3 h-[92px] object-contain" />
            <h2 className="mb-4 text-balance text-[30px] font-black leading-[1.1] tracking-[-.03em] lg:text-[40px]">
              Seja um dos primeiros a ver o dinheiro com clareza
            </h2>
            <p className="mx-auto mb-8 max-w-[520px] text-[16px] leading-[1.55] sm:text-lg" style={{ color: "var(--fin-muted)" }}>
              Criar conta é grátis e leva menos de um minuto. Suba um extrato e a IA já devolve
              seus gastos organizados, sem planilha e sem julgamento.
            </p>
            <div className="mb-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <a
                href="/cadastro"
                className="fin-btn-3d rounded-2xl px-7 py-4 text-center text-base font-extrabold"
                style={{ background: "var(--fin-accent)", color: "var(--fin-bg)" }}
              >
                Criar conta grátis →
              </a>
              <a
                href="/login"
                className="rounded-2xl border-[1.5px] px-6 py-[15px] text-center text-base font-extrabold"
                style={{ borderColor: "var(--fin-border-2)", color: "var(--fin-text)" }}
              >
                Já tenho conta
              </a>
            </div>

            <div className="mx-auto max-w-[520px] border-t pt-8" style={{ borderColor: "var(--fin-border-2)" }}>
              <p className="mb-4 text-[15px] leading-[1.55]" style={{ color: "var(--fin-muted)" }}>
                Prefere só acompanhar por enquanto? Deixe seu e-mail e avisamos quando houver
                novidade. Sem spam.
              </p>
              <WaitlistForm />
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="mx-auto max-w-[760px] px-5 pb-16 pt-5 sm:px-6">
        <Reveal>
          <h2 className="mb-10 text-center text-[28px] font-black leading-tight tracking-[-.02em] lg:text-[34px]">
            Perguntas frequentes
          </h2>
        </Reveal>
        <Faq />
      </section>

      {/* ============ FINLOW PARA ESCOLAS ============ */}
      <section className="mx-auto max-w-[760px] px-5 pb-24 sm:px-6">
        <Reveal>
          <a
            href="mailto:finlow.app@gmail.com?subject=Finlow%20para%20Escolas"
            className="block rounded-2xl border-[1.5px] p-5 transition-opacity hover:opacity-90"
            style={{
              background: "var(--fin-surface-2)",
              borderColor: "color-mix(in srgb, var(--fin-accent) 40%, transparent)",
            }}
          >
            <div className="text-[11px] font-black uppercase tracking-[1.2px]" style={{ color: "var(--fin-accent)" }}>
              Finlow para Escolas
            </div>
            <div className="mt-1.5 text-[15px] font-extrabold" style={{ color: "var(--fin-text)" }}>
              Trilhas alinhadas à matriz do Banco Central, do 1º ano ao Ensino Médio →
            </div>
          </a>
        </Reveal>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t px-5 pb-10 pt-14 sm:px-6" style={{ borderColor: "var(--fin-border)", background: "var(--fin-surface-2)", color: "var(--fin-muted)" }}>
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-start justify-between gap-8">
          <div className="max-w-[320px]">
            <div className="mb-3.5 flex items-center gap-2.5">
              <LogoMarca />
              <span className="text-[19px] font-black tracking-tight" style={{ color: "var(--fin-text)" }}>finlow</span>
            </div>
            <p className="text-sm leading-[1.55]">
              O espaço onde o dinheiro para de ser confuso. Clareza financeira com inteligência artificial.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-14 gap-y-6">
            <div className="flex flex-col text-sm">
              <span className="mb-2 font-extrabold" style={{ color: "var(--fin-text)" }}>Produto</span>
              <a href="#recursos" className="py-2.5 transition-colors hover:text-[var(--fin-accent)]">Recursos</a>
              <a href="#como" className="py-2.5 transition-colors hover:text-[var(--fin-accent)]">Como funciona</a>
              <a href="/cadastro" className="py-2.5 transition-colors hover:text-[var(--fin-accent)]">Criar conta</a>
              <a href="/login" className="py-2.5 transition-colors hover:text-[var(--fin-accent)]">Entrar</a>
              <a href="#lista" className="py-2.5 transition-colors hover:text-[var(--fin-accent)]">Novidades por e-mail</a>
            </div>
            <div className="flex flex-col text-sm">
              <span className="mb-2 font-extrabold" style={{ color: "var(--fin-text)" }}>Empresa</span>
              <a href="/empresas" className="py-2.5 transition-colors hover:text-[var(--fin-accent)]">Para empresas</a>
              <a href="#faq" className="py-2.5 transition-colors hover:text-[var(--fin-accent)]">Dúvidas</a>
              <a href="mailto:finlow.app@gmail.com" className="py-2.5 transition-colors hover:text-[var(--fin-accent)]">Contato</a>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-[1100px] flex-wrap justify-between gap-2.5 border-t pt-6 text-[12.5px]" style={{ borderColor: "var(--fin-border)", color: "var(--fin-dim)" }}>
          <span>© 2026 Finlow · Produto em desenvolvimento</span>
          <span>Feito com clareza, no Brasil 🇧🇷</span>
        </div>
      </footer>
    </div>
  )
}
