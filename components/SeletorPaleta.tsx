"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import {
  PALETAS,
  aplicarPaleta,
  escuroEfetivo,
  lerPaleta,
  lerTema,
  salvarPaleta,
  type Paleta,
} from "@/lib/tema"

/**
 * Escolha da cor de destaque.
 *
 * A bolinha mostra a cor DO MODO ATUAL, não uma cor fixa. Cada paleta tem
 * valores próprios para claro e escuro: um destaque que funciona sobre papel
 * branco some sobre fundo quase-preto. Mostrar sempre a versão clara faria a
 * amostra mentir para quem usa no escuro, que é justamente quem mais repara.
 *
 * As três foram geradas resolvendo por CONTRASTE contra a página, não copiando
 * luminosidade: a mesma L em matizes diferentes rende contrastes muito
 * diferentes (no escuro, teal a L=52% dá 6,46 e índigo a L=52% dá 2,78). As
 * três batem 5,66 no claro e 6,47 no escuro, então nenhuma é mais difícil de
 * ler que a outra.
 */
export function SeletorPaleta() {
  // null até o cliente responder: renderizar "teal" no servidor e trocar na
  // hidratação piscaria a seleção.
  const [paleta, setPaleta] = useState<Paleta | null>(null)
  const [escuro, setEscuro] = useState(false)

  // Leitura no efeito porque no initializer o localStorage não existe no
  // servidor, e chutar valor lá diverge na hidratação. O set vai numa
  // microtask: a regra de hooks proíbe setState síncrono no efeito — o mesmo
  // caso, com a mesma solução, do SeletorTema ao lado.
  useEffect(() => {
    Promise.resolve().then(() => {
      setPaleta(lerPaleta())
      setEscuro(escuroEfetivo(lerTema()))
    })
  }, [])

  // A amostra acompanha a troca de tema feita ao lado, sem recarregar.
  useEffect(() => {
    const alvo = document.documentElement
    const obs = new MutationObserver(() => setEscuro(alvo.classList.contains("dark")))
    obs.observe(alvo, { attributes: true, attributeFilter: ["class"] })
    return () => obs.disconnect()
  }, [])

  function escolher(nova: Paleta) {
    setPaleta(nova)
    salvarPaleta(nova)
    aplicarPaleta(nova)
  }

  return (
    <div role="radiogroup" aria-label="Cor de destaque" className="flex flex-col gap-1.5">
      {PALETAS.map((p) => {
        const ativa = paleta === p.valor
        const amostra = escuro ? p.amostraEscuro : p.amostraClaro
        return (
          <button
            key={p.valor}
            role="radio"
            aria-checked={ativa}
            onClick={() => escolher(p.valor)}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
              ativa ? "border-fl-500 bg-fl-50" : "border-fl-border hover:bg-fl-50/60"
            }`}
          >
            <span
              aria-hidden
              className="cor-dado size-5 shrink-0 rounded-full ring-1 ring-inset ring-black/10"
              style={{ background: amostra }}
            />
            <span className="flex-1 text-[14px] text-fl-ink">{p.rotulo}</span>
            {ativa && <Check className="size-4 shrink-0 text-fl-500" />}
          </button>
        )
      })}
    </div>
  )
}
