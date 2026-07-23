import Link from "next/link"
import { Space_Grotesk, Manrope } from "next/font/google"
import { ContatoForm } from "@/components/landing/ContatoForm"
import { EMAIL_CONTATO } from "@/lib/constantes"

const grotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "700"] })
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "600", "700", "800"] })

// Depoimentos desligados até existirem depoimentos REAIS de testers
// (os do design original eram placeholders — não publicar review inventada).
const MOSTRAR_DEPOIMENTOS = false

const steps = [
  { n: "01", badge: "bg-finlow-green", title: "Diagnóstico rápido", desc: "Cenários reais, não perguntas de prova. Em 2 minutos, o Finlow identifica seu padrão de comportamento com dinheiro." },
  { n: "02", badge: "bg-finlow-yellow", title: "Seu perfil revelado", desc: "Lançador, Guardador, Impulsivo ou Sonhador — você descobre por que sabe o que fazer e mesmo assim não faz." },
  { n: "03", badge: "bg-finlow-green", title: "Trilha personalizada", desc: "Módulos curtos feitos pro seu padrão específico. Nada de curso genérico: só o que muda o seu comportamento." },
]

const perfis = [
  { nome: "Lançador", tag: "GASTO IMEDIATO", verde: true, desc: "Gasta o que recebe assim que recebe. O dinheiro entra e sai no mesmo ciclo, sem espaço para reserva ou planejamento.", frase: "Criar um intervalo consciente entre receber e gastar." },
  { nome: "Guardador", tag: "RETENÇÃO EXCESSIVA", verde: false, desc: "Poupa além do necessário e sente desconforto mesmo em gastos essenciais. O dinheiro gera ansiedade em vez de segurança.", frase: "Gastar com critério e sem culpa." },
  { nome: "Impulsivo", tag: "GATILHO EMOCIONAL", verde: false, desc: "Compra movido pela emoção do momento — ansiedade, tédio ou comparação social — e percebe o padrão só depois da compra.", frase: "Reconhecer o gatilho antes da decisão de compra." },
  { nome: "Sonhador", tag: "PLANO SEM EXECUÇÃO", verde: true, desc: "Planeja, define metas e organiza tudo — mas raramente dá o primeiro passo. A busca pelo plano perfeito adia a ação.", frase: "Transformar planejamento em ação concreta." },
]

const tiposTela = [
  { nome: "Conceito", desc: "Teoria curta, sem jargão", verde: true },
  { nome: "Cenário", desc: "Situação real do seu dia", verde: false },
  { nome: "Quiz", desc: "Fixação em uma pergunta", verde: true },
  { nome: "Input", desc: "Reflexão pessoal", verde: false },
  { nome: "Resultado", desc: "O que levar pra vida", verde: true },
]

export default function LandingPage() {
  return (
    <main className={`${manrope.className} min-h-dvh overflow-hidden bg-finlow-bg text-finlow-text`}>

      {/* ===== NAV ===== */}
      <nav className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-6 sm:px-8">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="" className="h-[34px] w-[34px]" />
          <span className={`${grotesk.className} text-[22px] font-bold tracking-tight`}>finlow</span>
        </div>
        <div className="flex items-center gap-4 lg:gap-8">
          <div className="hidden items-center gap-8 lg:flex">
            <a href="#como" className="text-[15px] font-semibold text-finlow-muted hover:text-finlow-text">Como funciona</a>
            <a href="#perfis" className="text-[15px] font-semibold text-finlow-muted hover:text-finlow-text">Perfis</a>
            <a href="#planos" className="text-[15px] font-semibold text-finlow-muted hover:text-finlow-text">Planos</a>
            <a href="#escolas" className="text-[15px] font-semibold text-finlow-muted hover:text-finlow-text">Para escolas</a>
            <a href="#contato" className="text-[15px] font-semibold text-finlow-muted hover:text-finlow-text">Contato</a>
          </div>
          <Link href="/login" className="text-[15px] font-semibold text-finlow-muted hover:text-finlow-text">Entrar</Link>
          <Link href="/cadastro" className="rounded-xl bg-finlow-green px-4 py-2.5 text-sm font-extrabold text-finlow-bg transition-colors hover:bg-[#33d6ab] sm:px-5 sm:py-3 sm:text-[15px]">
            Fazer diagnóstico
          </Link>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <header className="relative mx-auto grid max-w-[1180px] items-center gap-12 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:pb-24 lg:pt-16">
        <div aria-hidden className="pointer-events-none absolute -top-32 right-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(0,200,150,0.14),transparent_65%)]" />
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-finlow-green/35 bg-finlow-card px-4 py-1.5 text-[13px] font-bold text-finlow-green">
            Para quem já tem renda própria — e quer saber o que fazer com ela
          </div>
          <h1 className={`${grotesk.className} mb-6 text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[58px] lg:leading-[1.05]`}>
            Você já sabe o que fazer com seu dinheiro.{" "}
            <span className="text-finlow-green">O Finlow ajuda você a fazer.</span>
          </h1>
          <p className="mb-9 max-w-[520px] text-pretty text-[17px] leading-relaxed text-finlow-muted lg:text-[19px]">
            Conteúdo genérico não muda comportamento. Descubra seu perfil em 2 minutos e receba uma
            trilha de aprendizado personalizada para a <em className="not-italic font-bold text-finlow-text">sua</em> relação com o dinheiro.
          </p>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link
              href="/cadastro"
              className="rounded-2xl bg-finlow-green px-8 py-4 text-[17px] font-extrabold text-finlow-bg shadow-[0_8px_32px_rgba(0,200,150,0.35)] transition-all hover:-translate-y-0.5 hover:bg-[#33d6ab]"
            >
              Descobrir meu perfil →
            </Link>
            <span className="text-sm font-semibold text-finlow-muted">Grátis · 2 min · sem cartão</span>
          </div>
          <div className="mt-12 flex flex-wrap gap-8 lg:gap-9">
            <div><div className={`${grotesk.className} text-[26px] font-bold text-finlow-yellow`}>2 min</div><div className="text-[13px] font-semibold text-finlow-muted">por módulo</div></div>
            <div><div className={`${grotesk.className} text-[26px] font-bold text-finlow-yellow`}>4 perfis</div><div className="text-[13px] font-semibold text-finlow-muted">comportamentais</div></div>
            <div><div className={`${grotesk.className} text-[26px] font-bold text-finlow-yellow`}>5 formatos</div><div className="text-[13px] font-semibold text-finlow-muted">de tela interativa</div></div>
          </div>
        </div>

        {/* mockup do card flow */}
        <div className="flex justify-center [animation:floaty_6s_ease-in-out_infinite]">
          <div className="w-[300px] rounded-[36px] border border-white/10 bg-finlow-card p-4 shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
            <div className="mb-4 flex gap-1.5">
              <div className="h-1 flex-1 rounded-full bg-finlow-green" />
              <div className="h-1 flex-1 rounded-full bg-finlow-green" />
              <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/15"><div className="absolute inset-y-0 left-0 w-[64%] bg-finlow-green" /></div>
              <div className="h-1 flex-1 rounded-full bg-white/15" />
              <div className="h-1 flex-1 rounded-full bg-white/15" />
            </div>
            <div className="mb-2.5 text-xs font-extrabold tracking-widest text-finlow-yellow">CENÁRIO</div>
            <div className={`${grotesk.className} mb-4 text-xl font-bold leading-snug`}>
              Você recebeu R$ 150 de um trabalho. O que faz nos primeiros 10 minutos?
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="rounded-xl border border-finlow-green bg-finlow-green/10 px-4 py-3 text-sm font-bold text-finlow-green">Abro o app da loja</div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-finlow-muted">Separo uma parte antes de gastar</div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-finlow-muted">Deixo parado, sem plano definido</div>
            </div>
            <div className="mt-4 rounded-xl bg-finlow-green py-3.5 text-center text-[15px] font-extrabold text-finlow-bg">Continuar</div>
          </div>
        </div>
      </header>

      {/* ===== O PROBLEMA ===== */}
      <section className="border-y border-white/5 bg-finlow-card">
        <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-22">
          <div>
            <div className="mb-4 text-[13px] font-extrabold tracking-[2px] text-finlow-yellow">O PROBLEMA NÃO É O QUE VOCÊ SABE</div>
            <h2 className={`${grotesk.className} mb-5 text-balance text-3xl font-bold leading-tight tracking-tight lg:text-[40px]`}>
              Saber o que fazer nunca foi o suficiente.
            </h2>
            <p className="text-pretty text-[16px] leading-relaxed text-finlow-muted lg:text-[17px]">
              A maioria dos apps de educação financeira oferece teoria para um problema que é comportamental.
              O Finlow atua na distância entre <strong className="text-finlow-text">intenção</strong> e{" "}
              <strong className="text-finlow-text">ação</strong> — começando por entender como{" "}
              <em className="not-italic font-bold text-finlow-green">você</em> se relaciona com o dinheiro.
            </p>
          </div>
          <div className="flex flex-col gap-3.5">
            {[
              { ok: false, titulo: "Curso genérico de finanças", desc: "Conteúdo padronizado, igual para todos — independente do comportamento de cada um." },
              { ok: false, titulo: "Conteúdo de banco", desc: "Linguagem técnica e distante da realidade de quem está começando." },
              { ok: true, titulo: "Trilha pro seu comportamento", desc: "Módulos de 2 minutos, específicos para o seu perfil. Valor prático desde a primeira sessão." },
            ].map((item) => (
              <div
                key={item.titulo}
                className={`flex items-start gap-4 rounded-2xl bg-finlow-bg p-5 sm:p-6 ${
                  item.ok ? "border border-finlow-green shadow-[0_8px_40px_rgba(0,200,150,0.12)]" : "border border-white/5"
                }`}
              >
                <div className={`flex h-7 w-7 min-w-7 items-center justify-center rounded-lg text-[15px] font-extrabold ${item.ok ? "bg-finlow-green/15 text-finlow-green" : "bg-finlow-yellow/15 text-finlow-yellow"}`}>
                  {item.ok ? "✓" : "✕"}
                </div>
                <div>
                  <div className="mb-1 text-base font-extrabold">{item.titulo}</div>
                  <div className="text-sm leading-relaxed text-finlow-muted">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section id="como" className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mb-12 text-center">
          <div className="mb-3.5 text-[13px] font-extrabold tracking-[2px] text-finlow-green">COMO FUNCIONA</div>
          <h2 className={`${grotesk.className} text-balance text-3xl font-bold tracking-tight lg:text-[42px]`}>Três passos, direto ao ponto.</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-[20px] border border-white/5 bg-finlow-card p-7 transition-all hover:-translate-y-1 hover:border-finlow-green/50">
              <div className={`${grotesk.className} mb-5 flex h-10 w-10 items-center justify-center rounded-xl text-[15px] font-bold text-finlow-bg ${s.badge}`}>{s.n}</div>
              <h3 className={`${grotesk.className} mb-3 text-[22px] font-bold tracking-tight`}>{s.title}</h3>
              <p className="text-pretty text-[15px] leading-relaxed text-finlow-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== OS 4 PERFIS ===== */}
      <section id="perfis" className="border-t border-white/5 bg-gradient-to-b from-finlow-bg to-[#0a1622]">
        <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8 lg:py-24">
          <div className="mb-12 max-w-[640px]">
            <div className="mb-3.5 text-[13px] font-extrabold tracking-[2px] text-finlow-yellow">OS 4 PERFIS</div>
            <h2 className={`${grotesk.className} mb-4 text-balance text-3xl font-bold tracking-tight lg:text-[42px]`}>
              Quatro formas de se relacionar com o dinheiro
            </h2>
            <p className="text-[16px] leading-relaxed text-finlow-muted lg:text-[17px]">
              Cada pessoa tem um padrão de comportamento financeiro. O diagnóstico identifica o seu — e a trilha trabalha exatamente esse padrão.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {perfis.map((p) => (
              <div key={p.nome} className="relative overflow-hidden rounded-[22px] border border-white/5 bg-finlow-card p-7 transition-transform hover:-translate-y-1 sm:p-8">
                <div
                  aria-hidden
                  className={`absolute right-0 top-0 h-40 w-40 rounded-full ${p.verde ? "bg-[radial-gradient(circle_at_top_right,rgba(0,200,150,0.12),transparent_70%)]" : "bg-[radial-gradient(circle_at_top_right,rgba(245,166,35,0.12),transparent_70%)]"}`}
                />
                <div className={`mb-4 inline-block rounded-full px-3.5 py-1.5 text-xs font-extrabold tracking-[1.5px] ${p.verde ? "bg-finlow-green/10 text-finlow-green" : "bg-finlow-yellow/10 text-finlow-yellow"}`}>
                  {p.tag}
                </div>
                <h3 className={`${grotesk.className} mb-2.5 text-[26px] font-bold tracking-tight`}>{p.nome}</h3>
                <p className="mb-5 text-pretty text-[15px] leading-relaxed text-finlow-muted">{p.desc}</p>
                <div className="border-t border-white/10 pt-4">
                  <div className="mb-1.5 text-[11px] font-extrabold tracking-[1.5px] text-finlow-muted">FOCO DA TRILHA</div>
                  <div className={`text-[14.5px] font-bold ${p.verde ? "text-finlow-green" : "text-finlow-yellow"}`}>{p.frase}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== A EXPERIÊNCIA ===== */}
      <section className="mx-auto grid max-w-[1180px] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-24">
        <div className="order-2 flex flex-wrap gap-3 lg:order-1">
          {tiposTela.map((t) => (
            <div key={t.nome} className="flex items-center gap-3 rounded-[14px] border border-white/10 bg-finlow-card px-5 py-4">
              <div className={`h-2.5 w-2.5 rounded-full ${t.verde ? "bg-finlow-green" : "bg-finlow-yellow"}`} />
              <div>
                <div className="text-[15px] font-extrabold">{t.nome}</div>
                <div className="text-[13px] text-finlow-muted">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="order-1 lg:order-2">
          <div className="mb-3.5 text-[13px] font-extrabold tracking-[2px] text-finlow-green">A EXPERIÊNCIA</div>
          <h2 className={`${grotesk.className} mb-5 text-balance text-3xl font-bold leading-tight tracking-tight lg:text-[40px]`}>
            Rápido de consumir. Feito para criar hábito.
          </h2>
          <p className="text-pretty text-[16px] leading-relaxed text-finlow-muted lg:text-[17px]">
            Telas sequenciais em módulos de cerca de 2 minutos, com cinco formatos que se intercalam — conceito,
            cenário prático, pergunta e reflexão. Linguagem clara, sem termos técnicos soltos. Você sai da{" "}
            <strong className="text-finlow-text">primeira sessão</strong> com algo para aplicar no mesmo dia.
          </p>
        </div>
      </section>

      {/* ===== DEPOIMENTOS (desligado até ter depoimento real) ===== */}
      {MOSTRAR_DEPOIMENTOS && (
        <section className="border-y border-white/5 bg-finlow-card">
          <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8">
            <h2 className={`${grotesk.className} mb-10 text-center text-3xl font-bold tracking-tight`}>Quem testou, sentiu a diferença</h2>
            {/* inserir depoimentos reais dos beta testers aqui antes de ligar */}
          </div>
        </section>
      )}

      {/* ===== PLANOS ===== */}
      <section id="planos" className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8 lg:py-24">
        <div className="mb-12 text-center">
          <div className="mb-3.5 text-[13px] font-extrabold tracking-[2px] text-finlow-green">PLANOS</div>
          <h2 className={`${grotesk.className} mb-4 text-balance text-3xl font-bold tracking-tight lg:text-[42px]`}>
            Comece de graça. Evolua quando fizer sentido.
          </h2>
          <p className="mx-auto max-w-[560px] text-[16px] leading-relaxed text-finlow-muted lg:text-[17px]">
            Do diagnóstico gratuito à trilha completa, até a licença para escolas.
          </p>
        </div>
        <div className="grid items-stretch gap-6 md:grid-cols-3">

          {/* Gratuito */}
          <div className="flex flex-col rounded-[22px] border border-white/10 bg-finlow-card p-7 sm:p-8">
            <div className={`${grotesk.className} mb-1.5 text-xl font-bold`}>Gratuito</div>
            <div className="mb-5 text-sm text-finlow-muted">Para dar o primeiro passo</div>
            <div className="mb-6 flex items-baseline gap-1.5">
              <span className={`${grotesk.className} text-[44px] font-bold`}>R$ 0</span>
              <span className="text-[15px] font-semibold text-finlow-muted">/ sempre</span>
            </div>
            <div className="mb-8 flex flex-1 flex-col gap-3 text-[14.5px]">
              <div className="flex gap-3"><span className="font-extrabold text-finlow-green">✓</span> Diagnóstico comportamental completo</div>
              <div className="flex gap-3"><span className="font-extrabold text-finlow-green">✓</span> Seu perfil entre os 4 tipos</div>
              <div className="flex gap-3"><span className="font-extrabold text-finlow-green">✓</span> Primeiros módulos da trilha</div>
              <div className="flex gap-3"><span className="font-extrabold text-finlow-green">✓</span> Painel de controle financeiro</div>
            </div>
            <Link href="/cadastro" className="rounded-xl border-[1.5px] border-white/20 py-3.5 text-center text-[15px] font-extrabold transition-colors hover:border-finlow-green hover:text-finlow-green">
              Fazer diagnóstico
            </Link>
          </div>

          {/* Premium */}
          <div className="relative flex flex-col rounded-[22px] border-[1.5px] border-finlow-green bg-gradient-to-b from-[#123a30] to-[#0f2b25] p-7 shadow-[0_16px_60px_rgba(0,200,150,0.18)] sm:p-8">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-finlow-green px-4 py-1.5 text-xs font-extrabold tracking-wide text-finlow-bg">
              MAIS POPULAR
            </div>
            <div className={`${grotesk.className} mb-1.5 text-xl font-bold`}>Premium</div>
            <div className="mb-5 text-sm text-finlow-muted">Para transformar o hábito</div>
            <div className="mb-6 flex items-baseline gap-1.5">
              <span className={`${grotesk.className} text-[44px] font-bold`}>R$ 14,90</span>
              <span className="text-[15px] font-semibold text-finlow-muted">/ mês</span>
            </div>
            <div className="mb-8 flex flex-1 flex-col gap-3 text-[14.5px]">
              <div className="flex gap-3"><span className="font-extrabold text-finlow-green">✓</span> Trilha personalizada completa</div>
              <div className="flex gap-3"><span className="font-extrabold text-finlow-green">✓</span> Todos os módulos e novos conteúdos</div>
              <div className="flex gap-3"><span className="font-extrabold text-finlow-green">✓</span> Acompanhamento de progresso</div>
              <div className="flex gap-3"><span className="font-extrabold text-finlow-green">✓</span> Rediagnóstico para acompanhar a evolução</div>
            </div>
            <Link href="/beta" className="rounded-xl bg-finlow-green py-3.5 text-center text-[15px] font-extrabold text-finlow-bg transition-colors hover:bg-[#33d6ab]">
              Assinar Premium
            </Link>
          </div>

          {/* Escolas */}
          <div className="flex flex-col rounded-[22px] border border-finlow-yellow/35 bg-finlow-card p-7 sm:p-8">
            <div className={`${grotesk.className} mb-1.5 text-xl font-bold text-finlow-yellow`}>Para Escolas</div>
            <div className="mb-5 text-sm text-finlow-muted">Licença institucional</div>
            <div className="mb-6 flex items-baseline">
              <span className={`${grotesk.className} text-[36px] font-bold`}>Sob consulta</span>
            </div>
            <div className="mb-6 flex flex-1 flex-col gap-3 text-[14.5px]">
              <div className="flex gap-3"><span className="font-extrabold text-finlow-yellow">✓</span> Aulas e material de apoio para professores</div>
              <div className="flex gap-3"><span className="font-extrabold text-finlow-yellow">✓</span> Conteúdo alinhado à BNCC</div>
              <div className="flex gap-3"><span className="font-extrabold text-finlow-yellow">✓</span> Diagnóstico por turma e painel de progresso</div>
              <div className="flex gap-3"><span className="font-extrabold text-finlow-yellow">✓</span> Trilhas individuais para cada aluno</div>
              <div className="flex gap-3"><span className="font-extrabold text-finlow-yellow">✓</span> Consentimento dos responsáveis e LGPD</div>
            </div>
            <div className="mb-5 rounded-xl bg-finlow-yellow/10 px-4 py-3 text-[13px] leading-relaxed text-finlow-muted">
              Ensinamos segundo as competências da <strong className="text-finlow-yellow">BNCC</strong>, com formação e aulas prontas para os professores aplicarem em sala.
            </div>
            <a href="#contato" className="rounded-xl border-[1.5px] border-finlow-yellow py-3.5 text-center text-[15px] font-extrabold text-finlow-yellow transition-colors hover:bg-finlow-yellow hover:text-finlow-bg">
              Falar com a equipe
            </a>
          </div>
        </div>
      </section>

      {/* ===== PARA ESCOLAS ===== */}
      <section id="escolas" className="mx-auto max-w-[1180px] px-5 py-8 sm:px-8 lg:py-12">
        <div className="grid items-center gap-10 rounded-[28px] border border-finlow-yellow/30 bg-gradient-to-br from-finlow-card to-[#14232f] p-7 sm:p-10 lg:grid-cols-[1.2fr_0.8fr] lg:p-14">
          <div>
            <div className="mb-3.5 text-[13px] font-extrabold tracking-[2px] text-finlow-yellow">PARA ESCOLAS</div>
            <h2 className={`${grotesk.className} mb-4 text-balance text-3xl font-bold tracking-tight lg:text-4xl`}>
              Educação financeira que os alunos realmente usam.
            </h2>
            <p className="mb-7 text-pretty text-[15px] leading-relaxed text-finlow-muted lg:text-[16px]">
              Licencie o Finlow como parte do currículo. Diagnóstico por turma, trilhas individuais e acompanhamento
              de progresso — com consentimento dos responsáveis e conformidade total com a LGPD.
            </p>
            <a href="#contato" className="inline-block rounded-xl border-2 border-finlow-yellow px-7 py-3.5 text-[15px] font-extrabold text-finlow-yellow transition-colors hover:bg-finlow-yellow hover:text-finlow-bg">
              Falar com a equipe →
            </a>
          </div>
          <div className="flex flex-col gap-3.5">
            {[
              { t: "Diagnóstico por turma", d: "Mapa comportamental de cada sala" },
              { t: "Trilhas individuais", d: "Cada aluno segue o próprio ritmo" },
              { t: "LGPD by design", d: "Consentimento do responsável antes de qualquer dado" },
            ].map((i) => (
              <div key={i.t} className="rounded-[14px] bg-white/[0.04] px-5 py-4">
                <div className="text-[15px] font-extrabold text-finlow-yellow">{i.t}</div>
                <div className="text-[13.5px] text-finlow-muted">{i.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="relative overflow-hidden px-5 py-20 text-center sm:px-8 lg:py-28">
        <div aria-hidden className="pointer-events-none absolute -bottom-52 left-1/2 h-[500px] w-[min(800px,100vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(0,200,150,0.18),transparent_65%)]" />
        <h2 className={`${grotesk.className} mb-4 text-balance text-4xl font-bold tracking-tight lg:text-[50px]`}>
          Gaste com tranquilidade.<br />Construa seu futuro.
        </h2>
        <p className="mx-auto mb-10 max-w-[480px] text-pretty text-[16px] text-finlow-muted lg:text-lg">
          Com total autonomia, em linguagem feita para a sua geração. Comece pelo diagnóstico — leva 2 minutos.
        </p>
        <Link
          href="/cadastro"
          className="inline-block rounded-2xl bg-finlow-green px-10 py-5 text-lg font-extrabold text-finlow-bg shadow-[0_12px_48px_rgba(0,200,150,0.4)] transition-all hover:-translate-y-1 hover:bg-[#33d6ab]"
        >
          Descobrir meu perfil grátis →
        </Link>
        <div className="mt-5 text-[13.5px] font-semibold text-finlow-muted">
          Web app · funciona em qualquer dispositivo · sem cartão de crédito
        </div>
      </section>

      {/* ===== CONTATO ===== */}
      <section id="contato" className="border-t border-white/5 bg-finlow-card">
        <div className="mx-auto grid max-w-[1180px] items-start gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-22">
          <div>
            <div className="mb-3.5 text-[13px] font-extrabold tracking-[2px] text-finlow-green">FALE CONOSCO</div>
            <h2 className={`${grotesk.className} mb-4 text-balance text-3xl font-bold leading-tight tracking-tight lg:text-[38px]`}>
              Vamos conversar sobre o Finlow.
            </h2>
            <p className="mb-8 text-pretty text-[15px] leading-relaxed text-finlow-muted lg:text-[16px]">
              Dúvidas, parcerias com escolas ou imprensa — responderemos em até 1 dia útil.
            </p>
            <div className="flex flex-col gap-4">
              <a href={`mailto:${EMAIL_CONTATO}`} className="flex items-center gap-3.5">
                <div className="flex h-[42px] w-[42px] min-w-[42px] items-center justify-center rounded-xl bg-finlow-green/10">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00C896" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 5L2 7" /></svg>
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-finlow-muted">E-mail</div>
                  <div className="text-base font-bold text-finlow-text">{EMAIL_CONTATO}</div>
                </div>
              </a>
              <a href={`mailto:${EMAIL_CONTATO}?subject=${encodeURIComponent("Parceria com escola")}`} className="flex items-center gap-3.5">
                <div className="flex h-[42px] w-[42px] min-w-[42px] items-center justify-center rounded-xl bg-finlow-yellow/10">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-6 0v4" /><rect x="2" y="9" width="20" height="12" rx="2" /></svg>
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-finlow-muted">Parcerias com escolas</div>
                  <div className="text-base font-bold text-finlow-text">{EMAIL_CONTATO}</div>
                </div>
              </a>
            </div>
          </div>
          <ContatoForm />
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-3 px-5 py-8 sm:flex-row sm:px-8">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="" className="h-6 w-6" />
            <span className={`${grotesk.className} text-base font-bold`}>finlow</span>
          </div>
          <div className="text-center text-[13px] text-finlow-muted">© 2026 Finlow · Conformidade LGPD · Educação financeira comportamental</div>
        </div>
      </footer>
    </main>
  )
}
