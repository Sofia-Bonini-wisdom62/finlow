"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Sparkles, Lock, X } from "lucide-react"
import type { NoTrilha } from "@/lib/trilha-visual"
import { POSE } from "@/lib/fin"

interface DrawerModuloProps {
  no: NoTrilha | null
  numero: number | null
  aberto: boolean
  intensidade: "sobria" | "expressiva"
  onFechar: () => void
  /** Entra no módulo. Qual lição servir é decisão do servidor. */
  onComecar: (no: NoTrilha) => void
}

const NIVEL_LABEL: Record<NoTrilha["nivel"], string> = {
  iniciante: "iniciante",
  intermediario: "intermediário",
  avancado: "avançado",
}

const MOTIVOS = [
  "Recebi uma fatura com juros",
  "Estou negociando uma dívida agora",
  "Preciso decidir uma compra grande",
]

export default function DrawerModulo({
  no,
  numero,
  aberto,
  intensidade,
  onFechar,
  onComecar,
}: DrawerModuloProps) {
  const [dialogoAberto, setDialogoAberto] = useState(false)
  const [motivoSel, setMotivoSel] = useState<string>("")
  const [motivoLivre, setMotivoLivre] = useState("")

  useEffect(() => {
    if (!aberto) {
      setDialogoAberto(false)
      setMotivoSel("")
      setMotivoLivre("")
    }
  }, [aberto])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar()
    }
    if (aberto) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [aberto, onFechar])

  /**
   * As LIÇÕES do módulo, não as cinco telas do card flow.
   *
   * O protótipo desenhava "Conceito · Cenário · Quiz · Você · Resultado",
   * que é o percurso DENTRO de uma lição. O que a pessoa conclui, e o que o
   * corredor conta para liberar o módulo seguinte, é a lição — e há módulos
   * com 3 delas, os que não têm tela de cenário. Cravar cinco mostraria duas
   * etapas que nunca acendem.
   */
  const NOMES_LICAO = ["Novo conceito", "História", "Revisão", "Aplicação"]
  const etapas = NOMES_LICAO.slice(0, no?.telasTotal || 4)

  const cta = (() => {
    if (!no) return { label: "", disabled: false }
    switch (no.estado) {
      case "atual":
        return { label: "Continuar", disabled: false }
      case "disponivel":
      case "revisao":
        return { label: "Começar", disabled: false }
      case "concluido":
        return { label: "Refazer", disabled: false }
      case "travado":
        return {
          label: no.destravadoPor
            ? `Conclua "${no.destravadoPor}" para abrir`
            : "Bloqueado",
          disabled: true,
        }
    }
  })()

  /**
   * A válvula de escape do módulo trancado.
   *
   * No protótipo isto chamava um reordenador que "a IA" resolvia — e essa
   * função não existe. Mas a máquina existe do outro lado: quando o assistente
   * identifica uma necessidade na conversa, ele TROCA uma aula da leva
   * (`guardarRecomendacaoDoChat`). Então a saída honesta é levar a pessoa até
   * lá com o assunto já escrito, em vez de fingir um botão que reorganiza a
   * trilha sozinho.
   *
   * O texto vai na URL e o chat o usa como primeira mensagem.
   */
  function confirmarNecessidade() {
    if (!no) return
    const motivo = motivoLivre.trim() || motivoSel
    if (!motivo) return
    const pergunta = `${motivo}. Preciso de "${no.titulo}" agora, dá pra adiantar na minha trilha?`
    window.location.href = `/chat?pergunta=${encodeURIComponent(pergunta)}`
  }

  return (
    <AnimatePresence>
      {aberto && no && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onFechar}
            aria-hidden="true"
          />
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={no.titulo}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl"
            style={{ backgroundColor: "var(--finlow-surface)" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            {/* handle */}
            <div className="flex justify-center pt-3">
              <span
                className="h-1.5 w-10 rounded-full"
                style={{ backgroundColor: "var(--finlow-surface-2)" }}
                aria-hidden="true"
              />
            </div>

            <div className="p-4">
              {/* thumbnail — sem imagem, o Fin assume: o fallback antigo era
                  "/placeholder.svg", que nunca existiu, e todo módulo sem thumb
                  abria com um 16:9 quebrado (item 5 da avaliação de UX). */}
              <div
                className="relative mb-4 aspect-video w-full overflow-hidden rounded-2xl"
                style={{ backgroundColor: "var(--finlow-surface-2)" }}
              >
                {no.thumbnail ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={no.thumbnail} alt="" className="h-full w-full object-cover" />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={POSE.teach}
                    alt=""
                    className="mx-auto h-full object-contain py-3"
                  />
                )}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, var(--finlow-surface) 4%, transparent 55%)",
                  }}
                />
                {numero !== null && (
                  <span
                    className="absolute left-3 top-3 rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--finlow-bg) 60%, transparent)",
                      color: "var(--finlow-text)",
                    }}
                  >
                    Módulo {numero}
                  </span>
                )}
              </div>

              <h2
                className="text-xl font-semibold leading-tight text-balance"
                style={{ color: "var(--finlow-text)" }}
              >
                {no.titulo}
              </h2>
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--finlow-muted)" }}
              >
                {no.subtitulo}
              </p>

              {/* chips */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[
                  `~${no.duracaoMin} min`,
                  NIVEL_LABEL[no.nivel],
                  `+${no.pontos} pts`,
                  ...no.tags,
                ].map((c, i) => (
                  <span
                    key={i}
                    className="rounded-full px-2 py-0.5 text-[12px]"
                    style={{
                      backgroundColor: "var(--finlow-surface-2)",
                      color: "var(--finlow-muted)",
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>

              {/* Por que agora */}
              {no.motivoIa && (
                <div
                  className="mt-4 flex gap-2 rounded-xl p-3"
                  style={{ backgroundColor: "var(--finlow-surface-2)" }}
                >
                  <Sparkles
                    size={16}
                    className="mt-0.5 shrink-0"
                    style={{ color: "var(--finlow-accent)" }}
                    aria-hidden="true"
                  />
                  <div>
                    <p
                      className="text-[13px] font-semibold"
                      style={{ color: "var(--finlow-text)" }}
                    >
                      Por que agora
                    </p>
                    <p
                      className="mt-0.5 text-[13px] leading-relaxed"
                      style={{ color: "var(--finlow-muted)" }}
                    >
                      {no.motivoIa}
                    </p>
                  </div>
                </div>
              )}

              {/* Stepper do card flow */}
              <div className="mt-5">
                <div className="flex items-center justify-between gap-1">
                  {etapas.map((etapa, i) => {
                    const visto = i < no.telasVistas
                    const rotulo =
                      i === 2 && no.estado === "revisao"
                        ? "Quiz sem consulta"
                        : etapa
                    return (
                      <div
                        key={etapa}
                        className="flex flex-1 flex-col items-center gap-1.5"
                      >
                        <span
                          className="h-1.5 w-full rounded-full"
                          style={{
                            backgroundColor: visto
                              ? "var(--finlow-accent)"
                              : "var(--finlow-surface-2)",
                          }}
                        />
                        <span
                          className="text-center text-[10px] leading-tight"
                          style={{
                            color: visto
                              ? "var(--finlow-text)"
                              : "var(--finlow-muted)",
                          }}
                        >
                          {rotulo}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* CTA */}
              <button
                type="button"
                disabled={cta.disabled}
                onClick={cta.disabled || !no ? undefined : () => onComecar(no)}
                className="mt-5 flex h-[52px] w-full items-center justify-center rounded-xl px-4 text-center text-[15px] font-semibold"
                style={{
                  backgroundColor: cta.disabled
                    ? "var(--finlow-surface-2)"
                    : "var(--finlow-accent)",
                  color: cta.disabled
                    ? "var(--finlow-locked-text)"
                    : "var(--finlow-bg)",
                  cursor: cta.disabled ? "not-allowed" : "pointer",
                }}
              >
                {cta.label}
              </button>
              {no.estado === "concluido" && (
                <p
                  className="mt-2 text-center text-[11px]"
                  style={{ color: "var(--finlow-muted)" }}
                >
                  Refazer não pontua de novo.
                </p>
              )}

              {/* válvula de escape do estado travado */}
              {no.estado === "travado" && !dialogoAberto && (
                <button
                  type="button"
                  onClick={() => setDialogoAberto(true)}
                  className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-[14px] font-medium"
                  style={{
                    border: "1px solid var(--finlow-surface-2)",
                    color: "var(--finlow-text)",
                  }}
                >
                  <Lock size={15} aria-hidden="true" />
                  Preciso disso agora
                </button>
              )}

              {/* mini-diálogo */}
              <AnimatePresence>
                {dialogoAberto && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 overflow-hidden rounded-xl"
                    style={{ backgroundColor: "var(--finlow-surface-2)" }}
                  >
                    <div className="p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <p
                          className="text-[13px] font-semibold"
                          style={{ color: "var(--finlow-text)" }}
                        >
                          Por que você precisa disso agora?
                        </p>
                        <button
                          type="button"
                          onClick={() => setDialogoAberto(false)}
                          aria-label="Fechar"
                          style={{ color: "var(--finlow-muted)" }}
                        >
                          <X size={16} aria-hidden="true" />
                        </button>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {MOTIVOS.map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => {
                              setMotivoSel(m)
                              setMotivoLivre("")
                            }}
                            className="rounded-lg px-3 py-2 text-left text-[13px]"
                            style={{
                              border: `1px solid ${
                                motivoSel === m
                                  ? "var(--finlow-accent)"
                                  : "transparent"
                              }`,
                              backgroundColor: "var(--finlow-surface)",
                              color: "var(--finlow-text)",
                            }}
                          >
                            {m}
                          </button>
                        ))}
                        <input
                          type="text"
                          value={motivoLivre}
                          onChange={(e) => {
                            setMotivoLivre(e.target.value)
                            setMotivoSel("")
                          }}
                          placeholder="Outro motivo…"
                          className="rounded-lg px-3 py-2 text-[13px] outline-none"
                          style={{
                            backgroundColor: "var(--finlow-surface)",
                            color: "var(--finlow-text)",
                            border: "1px solid var(--finlow-surface-2)",
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        disabled={!motivoSel && !motivoLivre.trim()}
                        onClick={confirmarNecessidade}
                        className="mt-3 flex h-11 w-full items-center justify-center rounded-lg text-[14px] font-semibold disabled:opacity-50"
                        style={{
                          backgroundColor: "var(--finlow-accent)",
                          color: "var(--finlow-bg)",
                        }}
                      >
                        Enviar para a IA reordenar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
