import { Inter } from "next/font/google"
import { WaitlistForm } from "@/components/landing/WaitlistForm"
import { Faq } from "@/components/landing/Faq"
import { Reveal } from "@/components/landing/Reveal"

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] })

function LogoMarca({ tamanho = 30 }: { tamanho?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="Finlow"
      width={tamanho}
      height={tamanho}
      className="shrink-0 rounded-[22%]"
      style={{ width: tamanho, height: tamanho }}
    />
  )
}

export default function LandingPage() {
  return (
    <div className={`${inter.className} overflow-x-hidden bg-fl-page text-fl-ink [font-variant-numeric:tabular-nums]`}>

      {/* ============ NAV ============ */}
      <header className="sticky top-0 z-50 border-b border-fl-divider bg-fl-page/[0.82] backdrop-blur-[14px] backdrop-saturate-150">
        <nav className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-5 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2.5">
            <LogoMarca />
            <span className="text-[19px] font-bold tracking-tight">Finlow</span>
          </div>
          <div className="flex items-center gap-6 sm:gap-8">
            <div className="hidden gap-7 text-[14.5px] font-medium text-fl-ink-2 lg:flex">
              <a href="#problema" className="hover:text-fl-500">O problema</a>
              <a href="#recursos" className="hover:text-fl-500">Recursos</a>
              <a href="#como" className="hover:text-fl-500">Como funciona</a>
              <a href="#faq" className="hover:text-fl-500">Dúvidas</a>
            </div>
            <a
              href="#lista"
              className="flex min-h-11 items-center rounded-xl bg-fl-500 px-4 text-sm font-semibold text-primary-foreground shadow-[0_1px_2px_rgba(24,28,30,.08)] transition-colors hover:bg-fl-600 sm:px-5 sm:text-[14.5px]"
            >
              Entrar na lista
            </a>
          </div>
        </nav>

        {/* navegação de seções no mobile — o menu do desktop fica escondido aqui */}
        <div className="flex gap-1 overflow-x-auto border-t border-fl-divider px-3 pb-1.5 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
          {[
            ["#problema", "O problema"],
            ["#recursos", "Recursos"],
            ["#como", "Como funciona"],
            ["#faq", "Dúvidas"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="shrink-0 whitespace-nowrap rounded-lg px-2.5 py-2.5 text-[13.5px] font-medium text-fl-ink-2 active:bg-fl-50"
            >
              {label}
            </a>
          ))}
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-5 pb-10 pt-14 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:gap-14 lg:pt-20">
        <div aria-hidden className="pointer-events-none absolute -left-40 -top-10 h-[420px] w-[420px] opacity-60 [background:radial-gradient(circle,var(--fl-100)_0%,transparent_70%)]" />
        <Reveal className="relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-fl-accent-light px-3.5 py-[7px] text-[12.5px] font-semibold uppercase tracking-[.4px] text-fl-accent-dark">
            <span className="h-[7px] w-[7px] rounded-full bg-fl-accent [animation:pulseDot_2s_infinite]" />
            Em desenvolvimento · vagas de acesso antecipado
          </div>
          <h1 className="mb-5 text-balance text-[40px] font-extrabold leading-[1.04] tracking-[-.03em] sm:text-5xl lg:text-[56px]">
            Seu dinheiro,<br />enfim <span className="text-fl-500">claro.</span>
          </h1>
          <p className="mb-8 max-w-[500px] text-pretty text-[17px] leading-[1.55] text-fl-ink-2 sm:text-[19.5px]">
            O Finlow transforma a bagunça das suas finanças em clareza — com inteligência artificial
            que lê seus gastos, revela padrões que você não vê e te devolve o controle.{" "}
            <strong className="font-semibold text-fl-ink">Sem planilha, sem julgamento, sem esforço.</strong>
          </p>
          <div className="mb-6 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3.5">
            <a
              href="#lista"
              className="rounded-[14px] bg-fl-500 px-7 py-4 text-center text-base font-semibold text-primary-foreground shadow-[0_2px_8px_rgba(43,109,112,.28)] transition-colors hover:bg-fl-600"
            >
              Quero acesso antecipado →
            </a>
            <a
              href="#como"
              className="rounded-[14px] border-[1.5px] border-fl-500 px-6 py-[15px] text-center text-base font-semibold text-fl-500 transition-colors hover:bg-fl-50"
            >
              Ver como funciona
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[13.5px] text-fl-ink-2">
            <div className="flex items-center gap-2"><span className="font-bold text-fl-success">✓</span> Grátis para entrar na lista</div>
            <div className="hidden h-4 w-px bg-fl-border sm:block" />
            <div className="flex items-center gap-2"><span className="font-bold text-fl-success">✓</span> Cancele quando quiser</div>
          </div>
        </Reveal>

        {/* mockup — dashboard */}
        <Reveal className="relative flex justify-center">
          <div aria-hidden className="pointer-events-none absolute -inset-8 [background:radial-gradient(circle_at_60%_40%,var(--fl-50)_0%,transparent_65%)]" />
          <div className="relative w-[280px] sm:w-[300px] [animation:floaty_6s_ease-in-out_infinite]">
            <div className="mockup rounded-[44px] bg-fl-800 p-[11px] shadow-[0_30px_60px_-20px_rgba(17,47,48,.5),0_12px_24px_rgba(24,28,30,.16)]">
              <div className="flex h-[600px] flex-col overflow-hidden rounded-[34px] bg-fl-page">
                <div className="flex items-center justify-between px-[22px] pb-1.5 pt-4 text-xs font-semibold">
                  <span>9:41</span><span className="tracking-[2px]">● ● ●</span>
                </div>
                <div className="flex items-center justify-between px-[22px] pb-3.5 pt-2">
                  <div>
                    <div className="text-xs font-medium text-fl-ink-2">Bom dia, Marina</div>
                    <div className="text-base font-bold tracking-tight">Visão geral</div>
                  </div>
                  <div className="h-[34px] w-[34px] rounded-full bg-fl-100" />
                </div>
                <div className="mx-[18px] rounded-2xl border border-fl-border border-t-[3px] border-t-fl-500 bg-fl-card px-[18px] py-4 shadow-[0_1px_2px_rgba(24,28,30,.06)]">
                  <div className="text-[11px] font-semibold uppercase tracking-[.6px] text-fl-ink-2">Saldo disponível</div>
                  <div className="my-0.5 text-[30px] font-extrabold tracking-[-.02em]">R$ 8.240<span className="text-lg text-fl-ink-2">,50</span></div>
                  <div className="text-[12.5px] font-semibold text-fl-success">▲ 12% vs. mês passado</div>
                </div>
                <div className="grid grid-cols-2 gap-2.5 px-[18px] pb-1 pt-3.5">
                  <div className="rounded-xl border border-fl-border bg-fl-card px-3 py-2.5">
                    <div className="text-[10.5px] font-semibold text-fl-ink-2">Entradas</div>
                    <div className="text-[15px] font-bold text-fl-success">R$ 12.400</div>
                  </div>
                  <div className="rounded-xl border border-fl-border bg-fl-card px-3 py-2.5">
                    <div className="text-[10.5px] font-semibold text-fl-ink-2">Saídas</div>
                    <div className="text-[15px] font-bold text-fl-error">R$ 4.159</div>
                  </div>
                </div>
                <div className="mx-[18px] mt-2.5 flex items-center gap-4 rounded-2xl border border-fl-border bg-fl-card p-4">
                  <div
                    className="flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-full"
                    style={{ background: "conic-gradient(#2B6D70 0 42%,#B8863C 42% 62%,#7BAEB0 62% 82%,#E7DCC9 82% 100%)" }}
                  >
                    <div className="flex h-[52px] w-[52px] flex-col items-center justify-center rounded-full bg-fl-card">
                      <div className="text-sm font-extrabold">62%</div>
                      <div className="text-[8px] text-fl-ink-2">no plano</div>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 text-[11.5px]">
                    {[
                      { cor: "#2B6D70", nome: "Moradia", v: "R$ 1.7k" },
                      { cor: "#B8863C", nome: "Alimentação", v: "R$ 980" },
                      { cor: "#7BAEB0", nome: "Transporte", v: "R$ 620" },
                    ].map((l) => (
                      <div key={l.nome} className="flex items-center gap-2">
                        <span className="h-[9px] w-[9px] rounded-[3px]" style={{ background: l.cor }} />
                        <span className="flex-1 text-fl-ink-2">{l.nome}</span>
                        <span className="font-bold">{l.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-fl-divider bg-fl-card px-[30px] pb-5 pt-3.5">
                  <div className="h-[22px] w-[22px] rounded-md bg-fl-500" />
                  <div className="h-5 w-5 rounded-md bg-fl-100" />
                  <div className="h-5 w-5 rounded-full bg-fl-100" />
                  <div className="flex flex-col justify-center gap-[3px]">
                    <span className="h-[2.5px] w-5 rounded-sm bg-fl-100" />
                    <span className="h-[2.5px] w-5 rounded-sm bg-fl-100" />
                    <span className="h-[2.5px] w-3.5 rounded-sm bg-fl-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============ TRUST STRIP ============ */}
      <section className="mx-auto max-w-[1200px] px-5 pb-14 pt-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3.5 text-[13.5px] font-medium text-fl-ink-3">
          <span className="font-semibold text-fl-ink-2">Construído sobre 3 princípios:</span>
          <span className="flex items-center gap-2"><span className="text-fl-500">◆</span> Clareza antes de estímulo</span>
          <span className="flex items-center gap-2"><span className="text-fl-500">◆</span> Zero julgamento</span>
          <span className="flex items-center gap-2"><span className="text-fl-500">◆</span> Seus dados, seu controle</span>
        </div>
      </section>

      {/* ============ PROBLEMA ============ */}
      <section id="problema" className="bg-fl-sand px-5 py-16 sm:px-6 lg:py-22">
        <Reveal className="mx-auto max-w-[1000px] text-center">
          {/* Era âmbar (#8C651F): 3,87:1 sobre a areia, e a identidade reserva o
              dourado a conquista — "sua raridade é o que sustenta seu significado".
              O tom próprio da areia dá 7,58:1 e respeita essa regra. */}
          <div className="mb-4 text-[13px] font-bold uppercase tracking-[1.4px] text-fl-sand-text">
            Você conhece essa sensação
          </div>
          <h2 className="mx-auto mb-5 max-w-[760px] text-balance text-[32px] font-extrabold leading-[1.12] tracking-[-.025em] text-fl-sand-text lg:text-[40px]">
            O problema nunca foi falta de dinheiro. Foi falta de <span className="text-fl-500">clareza.</span>
          </h2>
          <p className="mx-auto mb-12 max-w-[620px] text-[16px] leading-[1.55] text-fl-sand-text sm:text-lg">
            Abrir o extrato dá um aperto. Você sabe que gasta demais em algum lugar — só não sabe onde.
            E toda vez que tenta organizar numa planilha, desiste na segunda semana.
          </p>
          <div className="grid gap-5 text-left sm:grid-cols-2 lg:grid-cols-3">
            {[
              { e: "😮‍💨", t: "Extrato confuso", d: "Dezenas de transações sem nome que faça sentido. Cadê o padrão?" },
              { e: "🧾", t: "Planilha abandonada", d: "Muito trabalho manual. Você nunca mantém por mais que alguns dias." },
              { e: "🌀", t: "Decisão no escuro", d: "Dá pra viajar esse mês? Cabe essa parcela? Você chuta — e torce." },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl bg-fl-page p-6">
                <div className="mb-3 text-[26px]">{c.e}</div>
                <div className="mb-1.5 text-base font-bold">{c.t}</div>
                <div className="text-sm leading-relaxed text-fl-ink-2">{c.d}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ============ RECURSOS ============ */}
      <section id="recursos" className="mx-auto max-w-[1200px] px-5 pb-10 pt-16 sm:px-6 lg:pt-24">
        <Reveal className="mx-auto mb-14 max-w-[720px] text-center">
          <div className="mb-4 text-[13px] font-bold uppercase tracking-[1.4px] text-fl-500">A virada de chave</div>
          <h2 className="mb-4 text-balance text-[32px] font-extrabold leading-[1.1] tracking-[-.03em] lg:text-[42px]">
            A IA faz o trabalho pesado. Você fica só com a clareza.
          </h2>
          <p className="text-[16px] leading-[1.55] text-fl-ink-2 sm:text-lg">
            O Finlow lê, categoriza e interpreta cada movimento — e traduz tudo em uma frase que você entende de primeira.
          </p>
        </Reveal>
        <Reveal className="grid gap-5 md:grid-cols-3">
          {[
            { icone: <div className="h-5 w-5 rounded-md bg-fl-500" />, t: "Insights que fazem sentido", d: "Nada de gráfico solto. A IA aponta exatamente onde seu dinheiro vaza e o que muda se você ajustar — em linguagem humana." },
            { icone: <div className="h-[18px] w-[22px] rounded-[8px_8px_8px_2px] bg-fl-500" />, t: "Converse com seu dinheiro", d: "\"Posso gastar R$ 300 esse fim de semana?\" Pergunte em português. O Finlow responde com base nos seus números reais." },
            { icone: <div className="h-5 w-5 rounded-full border-[5px] border-fl-500" />, t: "Controle de verdade", d: "Metas, orçamentos e alertas calmos — que avisam antes, não depois. Você decide com dados, não com culpa." },
          ].map((c) => (
            <div key={c.t} className="rounded-[20px] border border-fl-border bg-fl-card p-7 shadow-[0_1px_2px_rgba(24,28,30,.06)]">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[14px] bg-fl-50">{c.icone}</div>
              <h3 className="mb-2.5 text-xl font-bold tracking-tight">{c.t}</h3>
              <p className="text-[15px] leading-relaxed text-fl-ink-2">{c.d}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ============ SPLIT 1 — CHAT ============ */}
      <section className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-14 sm:px-6 lg:grid-cols-[.95fr_1.05fr] lg:gap-16 lg:py-[70px]">
        <Reveal className="order-2 flex justify-center lg:order-1">
          <div className="w-[270px] sm:w-[290px]">
            <div className="mockup rounded-[44px] bg-fl-800 p-[11px] shadow-[0_24px_50px_-20px_rgba(17,47,48,.45)]">
              <div className="flex h-[580px] flex-col overflow-hidden rounded-[34px] bg-fl-page">
                <div className="flex items-center gap-2.5 border-b border-fl-divider px-[22px] pb-3 pt-4">
                  <LogoMarca />
                  <div>
                    <div className="text-sm font-bold">Finlow IA</div>
                    <div className="text-[11px] font-medium text-fl-success">● online</div>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="max-w-[80%] self-end rounded-[16px_16px_4px_16px] bg-fl-500 px-3.5 py-2.5 text-[13.5px] leading-[1.45] text-white">
                    Posso gastar R$ 300 no rolê esse fim de semana?
                  </div>
                  <div className="max-w-[88%] self-start rounded-[16px_16px_16px_4px] border border-fl-border bg-fl-card px-3.5 py-3 text-[13.5px] leading-[1.5]">
                    Pode sim 🙂 Você tem R$ 640 livres no orçamento de lazer este mês. Gastando R$ 300, ainda fica dentro do plano.
                  </div>
                  <div className="max-w-[88%] self-start rounded-2xl border border-fl-border bg-fl-card p-3 text-[13px]">
                    <div className="mb-2 text-[11px] font-semibold text-fl-ink-2">Lazer · julho</div>
                    <div className="mb-1.5 h-2 overflow-hidden rounded-full bg-fl-divider">
                      <div className="h-full w-[53%] rounded-full bg-fl-500" />
                    </div>
                    <div className="flex justify-between text-[11px] text-fl-ink-2">
                      <span>R$ 360 usados</span><span className="font-bold text-fl-ink">R$ 640 livres</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 border-t border-fl-divider px-4 pb-[22px] pt-3.5">
                  <div className="flex-1 rounded-full border border-fl-border bg-fl-card px-4 py-2.5 text-[12.5px] text-[#A7ACAE]">
                    Pergunte qualquer coisa…
                  </div>
                  <div className="h-[38px] w-[38px] shrink-0 rounded-full bg-fl-500" />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal className="order-1 lg:order-2">
          <div className="mb-4 text-[13px] font-bold uppercase tracking-[1.4px] text-fl-500">Assistente financeiro</div>
          <h2 className="mb-4 text-balance text-[30px] font-extrabold leading-[1.12] tracking-[-.03em] lg:text-[38px]">
            Tire dúvidas de dinheiro como quem manda mensagem
          </h2>
          <p className="mb-7 max-w-[520px] text-[16px] leading-relaxed text-fl-ink-2 sm:text-[17.5px]">
            Chega de abrir cinco telas pra entender uma coisa. Pergunte em linguagem natural e receba uma
            resposta direta — baseada nos seus dados, não em conselho genérico da internet.
          </p>
          <div className="flex flex-col gap-4">
            {[
              ["Respostas com contexto real", " — cruza saldo, metas e histórico antes de responder."],
              ["Sem jargão", " — se usar um termo técnico, ele explica na hora."],
              ["Sempre calmo", " — nunca te faz sentir mal por uma pergunta."],
            ].map(([forte, resto]) => (
              <div key={forte} className="flex items-start gap-3">
                <span className="text-lg font-extrabold text-fl-500">✓</span>
                <span className="text-base leading-relaxed"><strong>{forte}</strong>{resto}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ============ SPLIT 2 — INSIGHTS ============ */}
      <section className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-14 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:py-[70px]">
        <Reveal>
          <div className="mb-4 text-[13px] font-bold uppercase tracking-[1.4px] text-fl-500">Insights automáticos</div>
          <h2 className="mb-4 text-balance text-[30px] font-extrabold leading-[1.12] tracking-[-.03em] lg:text-[38px]">
            Ele percebe o que você não teria tempo de notar
          </h2>
          <p className="mb-7 max-w-[520px] text-[16px] leading-relaxed text-fl-ink-2 sm:text-[17.5px]">
            Enquanto você vive sua vida, a IA cruza cada transação e faz emergir os padrões silenciosos —
            a assinatura esquecida, o gasto que dobrou, o mês em que sempre estoura.
          </p>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="rounded-[14px] bg-fl-50 p-5">
              <div className="text-[28px] font-extrabold tracking-[-.02em] text-fl-500">R$ 214</div>
              <div className="mt-1 text-[13px] text-fl-ink-2">em assinaturas esquecidas, detectadas no 1º mês*</div>
            </div>
            <div className="rounded-[14px] bg-fl-50 p-5">
              <div className="text-[28px] font-extrabold tracking-[-.02em] text-fl-500">0 min</div>
              <div className="mt-1 text-[13px] text-fl-ink-2">de digitação manual — categorização é automática</div>
            </div>
          </div>
          <p className="mt-3.5 text-[11.5px] text-fl-ink-3">*Estimativa de projeto em desenvolvimento, sujeita a validação.</p>
        </Reveal>
        <Reveal className="flex justify-center">
          <div className="w-[270px] sm:w-[290px]">
            <div className="mockup rounded-[44px] bg-fl-800 p-[11px] shadow-[0_24px_50px_-20px_rgba(17,47,48,.45)]">
              <div className="flex h-[580px] flex-col overflow-hidden rounded-[34px] bg-fl-page">
                <div className="px-[22px] pb-2.5 pt-4">
                  <div className="text-xs font-medium text-fl-ink-2">Para você hoje</div>
                  <div className="text-lg font-extrabold tracking-tight">Insights</div>
                </div>
                <div className="flex flex-1 flex-col gap-3 overflow-hidden px-4 pt-1.5">
                  <div className="rounded-[14px] border border-fl-border border-l-[3px] border-l-fl-accent bg-fl-card p-3.5">
                    <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[.5px] text-fl-accent-dark">⚑ Atenção</div>
                    <div className="text-[13.5px] leading-[1.45]">Seu gasto com <strong>delivery</strong> subiu <strong>38%</strong> este mês. São R$ 480 — o equivalente a 2 semanas do seu mercado.</div>
                  </div>
                  <div className="rounded-[14px] border border-fl-border border-l-[3px] border-l-fl-500 bg-fl-card p-3.5">
                    <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[.5px] text-fl-500">◆ Descoberta</div>
                    <div className="text-[13.5px] leading-[1.45]">Você paga <strong>2 apps de streaming</strong> quase iguais. Cancelar um economiza R$ 39,90/mês.</div>
                  </div>
                  <div className="rounded-[14px] border border-fl-border border-l-[3px] border-l-fl-success bg-fl-card p-3.5">
                    <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[.5px] text-fl-success">✓ No caminho</div>
                    <div className="text-[13.5px] leading-[1.45]">No ritmo atual, sua <strong>reserva de emergência</strong> chega à meta em 3 meses.</div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-fl-divider bg-fl-card px-[30px] pb-5 pt-3.5">
                  <div className="h-5 w-5 rounded-full bg-fl-100" />
                  <div className="h-5 w-5 rounded-md bg-fl-100" />
                  <div className="h-[22px] w-[22px] rounded-md bg-fl-500" />
                  <div className="flex flex-col gap-[3px]">
                    <span className="h-[2.5px] w-5 rounded-sm bg-fl-100" />
                    <span className="h-[2.5px] w-5 rounded-sm bg-fl-100" />
                    <span className="h-[2.5px] w-3.5 rounded-sm bg-fl-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============ COMO FUNCIONA ============ */}
      <section id="como" className="bg-fl-800 px-5 py-16 text-[#EDEEEC] sm:px-6 lg:py-24">
        <div className="mx-auto max-w-[1100px]">
          <Reveal className="mx-auto mb-14 max-w-[680px] text-center">
            <div className="mb-4 text-[13px] font-bold uppercase tracking-[1.4px] text-fl-dark-accent">Como funciona</div>
            <h2 className="text-balance text-[32px] font-extrabold leading-[1.1] tracking-[-.03em] text-white lg:text-[40px]">
              Da bagunça à clareza em três passos
            </h2>
          </Reveal>
          <Reveal className="grid gap-7 md:grid-cols-3">
            {[
              { n: "1", t: "Conecte suas contas", d: "Ligação segura e criptografada. Suas transações entram sozinhas — nada de digitar CSV." },
              { n: "2", t: "A IA organiza tudo", d: "Categoriza, encontra padrões e limpa o ruído. Em minutos, o caos vira um painel legível." },
              { n: "3", t: "Você decide com clareza", d: "Insights, metas e um assistente pronto para responder. Cada decisão apoiada em dados reais." },
            ].map((p) => (
              <div key={p.n}>
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-fl-dark-surface text-[19px] font-extrabold text-fl-dark-accent">
                  {p.n}
                </div>
                <h3 className="mb-2.5 text-xl font-bold text-white">{p.t}</h3>
                <p className="text-[15px] leading-relaxed text-fl-dark-text">{p.d}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ============ DIFERENCIAL ============ */}
      <section className="mx-auto max-w-[1000px] px-5 pb-14 pt-16 sm:px-6 lg:pt-24">
        <Reveal className="mx-auto mb-12 max-w-[680px] text-center">
          <div className="mb-4 text-[13px] font-bold uppercase tracking-[1.4px] text-fl-500">Por que Finlow</div>
          <h2 className="text-balance text-[32px] font-extrabold leading-[1.1] tracking-[-.03em] lg:text-[40px]">
            Feito para dar alívio — não mais uma cobrança
          </h2>
        </Reveal>
        <Reveal className="grid gap-5 md:grid-cols-2">
          <div className="rounded-[20px] border border-fl-border bg-fl-card p-7">
            <div className="mb-4 text-[13px] font-bold uppercase tracking-[.6px] text-fl-ink-3">Os outros apps</div>
            <div className="flex flex-col gap-3.5 text-[15px] text-fl-ink-2">
              {[
                "Gráficos que você precisa interpretar sozinho",
                "Categorização manual e cansativa",
                "Cores alarmantes e notificações de culpa",
                "Feito para quem já entende de finanças",
              ].map((t) => (
                <div key={t} className="flex gap-2.5"><span className="font-bold text-fl-error">✕</span> {t}</div>
              ))}
            </div>
          </div>
          <div className="rounded-[20px] bg-fl-500 p-7 text-primary-foreground shadow-[0_8px_24px_rgba(43,109,112,.24)]">
            <div className="mb-4 text-[13px] font-bold uppercase tracking-[.6px] text-primary-foreground">Com o Finlow</div>
            <div className="flex flex-col gap-3.5 text-[15px]">
              {[
                "A IA interpreta e te diz o que importa",
                "Tudo categorizado automaticamente",
                "Tom calmo, sem alarme, sem julgamento",
                "Feito para quem nunca aprendeu do assunto",
              ].map((t) => (
                <div key={t} className="flex gap-2.5"><span className="font-bold text-primary-foreground">✓</span> {t}</div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============ LISTA DE ESPERA ============ */}
      <section id="lista" className="px-5 pb-24 pt-10 sm:px-6">
        <Reveal className="relative mx-auto max-w-[820px] overflow-hidden rounded-[28px] bg-fl-sand px-6 py-14 text-center sm:px-12 sm:py-16">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-[260px] w-[260px] rounded-full [background:radial-gradient(circle,var(--fl-accent-light)_0%,transparent_70%)]" />
          <div className="relative">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-fl-page px-3.5 py-[7px] text-[12.5px] font-semibold tracking-[.4px] text-fl-accent-dark">
              <span className="h-[7px] w-[7px] rounded-full bg-fl-accent [animation:pulseDot_2s_infinite]" />
              Vagas limitadas de acesso antecipado
            </div>
            <h2 className="mb-4 text-balance text-[30px] font-extrabold leading-[1.1] tracking-[-.03em] text-fl-sand-text lg:text-[40px]">
              Seja um dos primeiros a ver o dinheiro com clareza
            </h2>
            <p className="mx-auto mb-8 max-w-[520px] text-[16px] leading-[1.55] text-fl-sand-text sm:text-lg">
              Entre na lista de espera e ganhe acesso antecipado, sem custo, assim que a primeira versão abrir.
              Sem spam — só um aviso quando for a sua vez.
            </p>
            <WaitlistForm />
          </div>
        </Reveal>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="mx-auto max-w-[760px] px-5 pb-24 pt-5 sm:px-6">
        <Reveal>
          <h2 className="mb-10 text-center text-[28px] font-extrabold leading-tight tracking-[-.02em] lg:text-[34px]">
            Perguntas frequentes
          </h2>
        </Reveal>
        <Faq />
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-fl-800 px-5 pb-10 pt-14 text-fl-dark-text sm:px-6">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-start justify-between gap-8">
          <div className="max-w-[320px]">
            <div className="mb-3.5 flex items-center gap-2.5">
              <LogoMarca />
              <span className="text-[19px] font-bold tracking-tight text-white">Finlow</span>
            </div>
            <p className="text-sm leading-[1.55]">
              O espaço onde o dinheiro para de ser confuso. Clareza financeira com inteligência artificial.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-14 gap-y-6">
            <div className="flex flex-col text-sm">
              <span className="mb-2 font-semibold text-white">Produto</span>
              <a href="#recursos" className="py-2.5 text-fl-dark-text hover:text-white">Recursos</a>
              <a href="#como" className="py-2.5 text-fl-dark-text hover:text-white">Como funciona</a>
              <a href="#lista" className="py-2.5 text-fl-dark-text hover:text-white">Acesso antecipado</a>
            </div>
            <div className="flex flex-col text-sm">
              <span className="mb-2 font-semibold text-white">Empresa</span>
              <a href="#faq" className="py-2.5 text-fl-dark-text hover:text-white">Dúvidas</a>
              <a href="mailto:finlow.app@gmail.com" className="py-2.5 text-fl-dark-text hover:text-white">Contato</a>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-[1100px] flex-wrap justify-between gap-2.5 border-t border-white/10 pt-6 text-[12.5px] text-fl-dark-text">
          <span>© 2026 Finlow · Produto em desenvolvimento</span>
          <span>Feito com clareza, no Brasil 🇧🇷</span>
        </div>
      </footer>
    </div>
  )
}
