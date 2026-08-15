"use client"

import { useCallback, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import type { NoTrilha, Trilha, TrilhaResumo, Usuario } from "@/lib/trilha-visual"
import TrilhaHeader from "./TrilhaHeader"
import SeletorTrilhas from "./SeletorTrilhas"
import Caminho from "./Caminho"
import DrawerModulo from "./DrawerModulo"
import { PopupLicaoDiaria } from "./fin/PopupLicaoDiaria"
import { ModalBau } from "./fin/ModalBau"
import { IntroFin } from "./fin/IntroFin"
import { POSE } from "@/lib/fin"

/**
 * O caminho da trilha.
 *
 * Veio do protótipo e perdeu três coisas que eram dele, não do produto: os
 * dados de mentira, o alternador de "pele" (sóbria/expressiva — o app tem
 * tema e paleta próprios, em Ajustes) e a BottomNav duplicada, que já existe
 * em components/bottom-nav.
 *
 * A intensidade ficou fixa em "sobria": o público no ar é adulto. Quando a
 * trilha escolar abrir, ela passa a vir do segmento da pessoa, não de um
 * botão na tela.
 */

interface Props {
  trilha: Trilha
  trilhas: TrilhaResumo[]
  usuario: Usuario
  /** true = primeira visita do dia (gatilho do pop-up de lição diária). */
  diaNovo?: boolean
}

/** Numera os nós do tronco (ignora ramos) na ordem em que aparecem. */
function mapaDeNumeros(trilha: Trilha): Record<string, number> {
  const mapa: Record<string, number> = {}
  let n = 0
  for (const bloco of trilha.blocos) {
    for (const no of bloco.nos) {
      if (no.ramo) continue
      n += 1
      mapa[no.moduloId] = n
    }
  }
  return mapa
}

export default function TrilhaContainer({ trilha, trilhas, usuario, diaNovo = false }: Props) {
  const router = useRouter()
  const [noSelecionado, setNoSelecionado] = useState<NoTrilha | null>(null)
  const [drawerAberto, setDrawerAberto] = useState(false)
  const [bauAberto, setBauAberto] = useState<string | null>(null)

  const numeros = useMemo(() => mapaDeNumeros(trilha), [trilha])

  /** O módulo em que a pessoa está — destino do "Fazer agora" do pop-up. */
  const moduloAtual = useMemo(() => {
    for (const b of trilha.blocos) {
      const atual = b.nos.find((n) => n.estado === "atual")
      if (atual) return atual
    }
    return null
  }, [trilha])

  const abrirNo = useCallback((no: NoTrilha) => {
    // Módulo trancado abre o drawer assim mesmo: ele explica o que falta.
    // Não abrir nada em cima de um toque deixa a pessoa sem resposta.
    setNoSelecionado(no)
    setDrawerAberto(true)
  }, [])

  const fecharDrawer = useCallback(() => setDrawerAberto(false), [])

  /**
   * Entrar no módulo. O servidor decide qual lição servir — mandar o número
   * daqui faria a tela adivinhar o que só o corredor sabe.
   */
  const comecar = useCallback(
    (no: NoTrilha) => {
      setDrawerAberto(false)
      router.push(`/trilha/${no.slug}`)
    },
    [router]
  )

  return (
    <div
      className="tema-fin finlow-no-scrollbar relative mx-auto min-h-dvh w-full max-w-md pb-28 lg:max-w-2xl"
      style={{ backgroundColor: "var(--finlow-bg)", color: "var(--finlow-text)" }}
    >
      <TrilhaHeader usuario={usuario} percentualAtivo={trilha.percentual} intensidade="sobria" />

      {/* Banner de precisão da semana — o Fin comemora com a pessoa. */}
      {usuario.precisaoSemana !== null && (
        <div className="px-4 pt-3">
          <div
            className="flex items-center gap-2.5 rounded-2xl border px-3.5 py-2.5"
            style={{ background: "var(--fin-surface)", borderColor: "var(--fin-border-2)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={POSE.cheer} alt="" className="size-9 shrink-0 object-contain" />
            <p className="text-[12.5px] leading-snug" style={{ color: "var(--fin-muted)" }}>
              <strong style={{ color: "var(--fin-acerto)" }}>
                {usuario.precisaoSemana}% de precisão
              </strong>{" "}
              esta semana — {usuario.precisaoSemana >= 60 ? "você está indo muito bem" : "cada revisão conta"}
              {usuario.nome ? `, ${usuario.nome.split(" ")[0]}` : ""}!
            </p>
          </div>
        </div>
      )}

      {/* O seletor só aparece quando há mais de uma trilha. Hoje o app adulto
          tem uma; ele existe para quando os segmentos escolares abrirem. */}
      {trilhas.length > 1 && (
        <div className="px-4 pt-3">
          <SeletorTrilhas
            trilhas={trilhas}
            ativa={trilha.id}
            onSelecionar={() => {}}
            onExplorar={() => {}}
          />
        </div>
      )}

      <main className="px-4 pt-4">
        <Caminho
          trilha={trilha}
          intensidade="sobria"
          haloModuloId={null}
          carregando={false}
          onSelecionarNo={abrirNo}
          onAbrirBau={setBauAberto}
        />
      </main>

      <DrawerModulo
        no={noSelecionado}
        numero={noSelecionado ? numeros[noSelecionado.moduloId] ?? null : null}
        aberto={drawerAberto}
        intensidade="sobria"
        onFechar={fecharDrawer}
        onComecar={comecar}
        custoDeEnergia={usuario.energia !== null}
      />

      <ModalBau refId={bauAberto} onFechar={() => setBauAberto(null)} />

      <PopupLicaoDiaria
        diaNovo={diaNovo}
        sequencia={usuario.sequencia}
        onFazer={() => {
          if (moduloAtual) router.push(`/trilha/${moduloAtual.slug}`)
        }}
      />

      <IntroFin />
    </div>
  )
}
