"use client"

import { useRef, useState } from "react"
import { Camera, Trash2 } from "lucide-react"

/**
 * O botão de trocar foto/banner do Perfil (personalização, 14/08/2026).
 *
 * O corte e a compressão acontecem AQUI, antes do POST: a imagem vira 256²
 * (foto) ou 1280×512 (banner) em JPEG, cortada pelo centro no modo "cover".
 * É o que deixa a imagem morar no banco sem inchá-lo — o servidor recusa o
 * que passar do teto, mas o caminho feliz nunca chega perto dele.
 */

const ALVO = {
  foto: { w: 256, h: 256, qualidade: 0.85 },
  banner: { w: 1280, h: 512, qualidade: 0.8 },
} as const

async function comprimir(arquivo: File, tipo: "foto" | "banner"): Promise<string> {
  const alvo = ALVO[tipo]
  const bitmap = await createImageBitmap(arquivo)
  const escala = Math.max(alvo.w / bitmap.width, alvo.h / bitmap.height)
  const w = bitmap.width * escala
  const h = bitmap.height * escala

  const canvas = document.createElement("canvas")
  canvas.width = alvo.w
  canvas.height = alvo.h
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("sem canvas")
  ctx.drawImage(bitmap, (alvo.w - w) / 2, (alvo.h - h) / 2, w, h)
  bitmap.close()
  return canvas.toDataURL("image/jpeg", alvo.qualidade)
}

export function TrocarImagem({
  tipo,
  temImagem,
  onMudou,
  className = "",
}: {
  tipo: "foto" | "banner"
  temImagem: boolean
  /** Chamado depois que o servidor confirmou — a tela fura o cache com ?v=. */
  onMudou: (tem: boolean) => void
  className?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function escolher(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    e.target.value = ""
    if (!arquivo) return
    setOcupado(true)
    setErro(null)
    try {
      const dados = await comprimir(arquivo, tipo)
      const r = await fetch("/api/imagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, dados }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) { setErro(d.error ?? "Não deu certo. Tenta outra imagem?"); return }
      onMudou(true)
    } catch {
      // createImageBitmap recusa formatos que o navegador não decodifica
      // (HEIC do iPhone é o caso clássico) — a mensagem aponta a saída.
      setErro("Não consegui abrir essa imagem. JPG e PNG funcionam sempre.")
    } finally {
      setOcupado(false)
    }
  }

  async function remover() {
    setOcupado(true)
    setErro(null)
    try {
      const r = await fetch(`/api/imagem?tipo=${tipo}`, { method: "DELETE" })
      if (r.ok) onMudou(false)
    } finally {
      setOcupado(false)
    }
  }

  return (
    <span className={`flex items-center gap-1.5 ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={escolher}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={ocupado}
        aria-label={tipo === "foto" ? "Trocar foto de perfil" : "Trocar imagem de capa"}
        className="grid size-8 place-items-center rounded-full border-[1.5px] border-fl-border bg-fl-page/85 text-fl-ink-2 backdrop-blur transition-colors hover:border-fl-500 hover:text-fl-500 disabled:opacity-50"
      >
        <Camera className="size-4" />
      </button>
      {temImagem && (
        <button
          type="button"
          onClick={remover}
          disabled={ocupado}
          aria-label={tipo === "foto" ? "Remover foto de perfil" : "Remover imagem de capa"}
          className="grid size-8 place-items-center rounded-full border-[1.5px] border-fl-border bg-fl-page/85 text-fl-ink-3 backdrop-blur transition-colors hover:border-fl-error hover:text-fl-error disabled:opacity-50"
        >
          <Trash2 className="size-3.5" />
        </button>
      )}
      {erro && (
        <span className="rounded-lg bg-fl-error/10 px-2 py-1 text-[11px] font-bold text-fl-error">
          {erro}
        </span>
      )}
    </span>
  )
}
