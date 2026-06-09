"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { PerfilCard, type TipoPerfil } from "@/components/perfil-card"

const perfis: Record<
  TipoPerfil,
  { titulo: string; subtitulo: string; descricao: string; cor: string }
> = {
  lancador: {
    titulo: "Tipo Lançador",
    subtitulo: "Você não tem medo de colocar o dinheiro pra trabalhar.",
    descricao:
      "Você gosta de ação e enxerga oportunidade onde os outros veem risco. Com um pouco de estratégia, esse perfil ousado pode transformar a renda que você já tem em algo muito maior — o segredo é não atropelar as etapas.",
    cor: "#00C896",
  },
  guardador: {
    titulo: "Tipo Guardador",
    subtitulo: "Segurança em primeiro lugar — e isso é uma força.",
    descricao:
      "Você prefere ter uma reserva e dormir tranquilo. Esse cuidado é raro e valioso. O próximo passo é fazer esse dinheiro guardado render, sem perder a tranquilidade que te define.",
    cor: "#F5A623",
  },
  impulsivo: {
    titulo: "Tipo Impulsivo",
    subtitulo: "Você vive o agora — bora dar um norte pra isso.",
    descricao:
      "Você gosta de aproveitar o momento e nem sempre planeja os gastos. Não tem problema: com pequenos hábitos e metas claras, dá pra continuar curtindo a vida sem o sufoco do fim do mês.",
    cor: "#F5A623",
  },
  sonhador: {
    titulo: "Tipo Sonhador",
    subtitulo: "Você tem grandes planos — vamos torná-los reais.",
    descricao:
      "Você sempre tem um objetivo em mente, seja uma viagem, um curso ou um sonho maior. Transformar esses sonhos em metas com prazo e valor é o que vai te levar lá mais rápido do que você imagina.",
    cor: "#00C896",
  },
}

export default function ResultadoPage() {
  // UI de demonstração — o tipo viria do diagnóstico
  const tipo: TipoPerfil = "lancador"
  const perfil = perfis[tipo]

  return (
    <main className="min-h-dvh bg-background bg-gradient-to-b from-background to-[#0a1622] px-5 py-8">
      <div className="mx-auto flex max-w-[390px] flex-col gap-8 lg:max-w-4xl">
        <header className="flex justify-center lg:justify-start">
          <span className="text-2xl font-bold text-primary">Finflow</span>
        </header>

        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
          <div className="flex flex-col items-center gap-6 lg:items-start lg:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
            >
              Seu perfil está pronto
              <span aria-hidden="true">🎯</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="hidden flex-col gap-3 lg:flex"
            >
              <h1 className="text-balance text-4xl font-bold leading-tight text-foreground">
                Esse é o jeito que você se relaciona com dinheiro.
              </h1>
              <p className="text-pretty leading-relaxed text-muted-foreground">
                A partir daqui, montamos uma trilha sob medida pra você evoluir no seu ritmo.
              </p>
            </motion.div>
          </div>

          <div className="flex flex-col gap-6">
            <PerfilCard
              tipo={tipo}
              titulo={perfil.titulo}
              subtitulo={perfil.subtitulo}
              descricao={perfil.descricao}
              cor={perfil.cor}
            />

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col gap-3"
            >
              <Button
                size="lg"
                nativeButton={false}
                className="h-14 rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
                render={<Link href="/trilha">Ver minha trilha</Link>}
              />
              <Button
                variant="outline"
                size="lg"
                nativeButton={false}
                className="h-14 rounded-full border-border bg-transparent text-base font-semibold text-foreground hover:bg-card"
                render={<Link href="/diagnostico">Refazer diagnóstico</Link>}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}
