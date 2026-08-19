"use client"

import { useRef, useState } from "react"
import { Camera, EllipsisVertical, Image as IconeCapa, Trash2 } from "lucide-react"
import { ModalFin } from "@/components/trilha-visual/fin/ModalFin"

/**
 * O menu do Perfil: trocar e remover foto e capa, escondido atrás de um botão.
 *
 * ANTES eram botões soltos na tela (pedido da fundadora, 18/08/2026, para
 * deixar o Perfil mais limpo): uma câmera e uma lixeira flutuando sobre a
 * capa, outra câmera colada no canto do retrato e uma terceira dupla no
 * convite "Adicionar uma capa". Cinco controles de manutenção competindo com
 * o conteúdo numa tela cujo assunto é o quanto a pessoa avançou.
 *
 * A lixeira sumir de cima da foto tem um efeito colateral bem-vindo: apagar a
 * própria capa deixa de ser um toque de distância no lugar em que o dedo
 * passa para rolar a página.
 *
 * O corte e a compressão acontecem AQUI, antes do POST: a imagem vira 256²
 * (foto) ou 1280×512 (capa) em JPEG, cortada pelo centro no modo "cover". É o
 * que deixa a imagem morar no banco sem inchá-lo, e o servidor recusa o que
 * passar do teto, mas o caminho feliz nunca chega perto dele.
 */

const ALVO = {
  foto: { w: 256, h: 256, qualidade: 0.85 },
  banner: { w: 1280, h: 512, qualidade: 0.8 },
} as const

type Tipo = "foto" | "banner"

async function comprimir(arquivo: File, tipo: Tipo): Promise<string> {
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

export function MenuDoPerfil({
  temFoto,
  temBanner,
  onMudou,
}: {
  temFoto: boolean
  temBanner: boolean
  /** Chamado depois que o servidor confirmou: a tela fura o cache com ?v=. */
  onMudou: (tipo: Tipo, tem: boolean) => void
}) {
  const [aberto, setAberto] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const inputFoto = useRef<HTMLInputElement>(null)
  const inputBanner = useRef<HTMLInputElement>(null)

  async function escolher(e: React.ChangeEvent<HTMLInputElement>, tipo: Tipo) {
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
      if (!r.ok) {
        setErro(d.error ?? "Não deu certo. Tenta outra imagem?")
        return
      }
      onMudou(tipo, true)
      setAberto(false)
    } catch {
      // createImageBitmap recusa formatos que o navegador não decodifica
      // (HEIC do iPhone é o caso clássico), e a mensagem aponta a saída.
      setErro("Não consegui abrir essa imagem. JPG e PNG funcionam sempre.")
    } finally {
      setOcupado(false)
    }
  }

  async function remover(tipo: Tipo) {
    const oQue = tipo === "foto" ? "sua foto de perfil" : "sua capa"
    if (!confirm(`Remover ${oQue}?`)) return
    setOcupado(true)
    setErro(null)
    try {
      const r = await fetch(`/api/imagem?tipo=${tipo}`, { method: "DELETE" })
      if (r.ok) {
        onMudou(tipo, false)
        setAberto(false)
      } else {
        setErro("Não deu certo. Tenta de novo?")
      }
    } catch {
      setErro("Sem conexão. Tenta de novo?")
    } finally {
      setOcupado(false)
    }
  }

  function fechar() {
    setErro(null)
    setAberto(false)
  }

  return (
    <>
      <input
        ref={inputFoto}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => escolher(e, "foto")}
      />
      <input
        ref={inputBanner}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => escolher(e, "banner")}
      />

      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label="Opções do perfil"
        aria-haspopup="dialog"
        className="grid size-9 place-items-center rounded-full border-[1.5px] border-fl-border bg-fl-page/85 text-fl-ink-2 backdrop-blur transition-colors hover:border-fl-500 hover:text-fl-500"
      >
        <EllipsisVertical className="size-[18px]" />
      </button>

      <ModalFin aberto={aberto} onFechar={fechar}>
        <h3 className="text-[20px] font-black tracking-tight">Foto e capa</h3>
        <p className="mx-auto mt-1 max-w-[280px] text-[13.5px] leading-relaxed" style={{ color: "var(--fin-muted)" }}>
          Só você vê estas imagens.
        </p>

        {erro && (
          <p className="mt-3 text-sm" style={{ color: "var(--fin-erro)" }}>
            {erro}
          </p>
        )}

        <div className="mt-5 space-y-2">
          <ItemDoMenu
            icone={<Camera className="size-[18px]" />}
            titulo={temFoto ? "Trocar foto de perfil" : "Escolher foto de perfil"}
            legenda="Fica redonda, recortada pelo centro."
            ocupado={ocupado}
            onClick={() => inputFoto.current?.click()}
          />
          {temFoto && (
            <ItemDoMenu
              icone={<Trash2 className="size-[18px]" />}
              titulo="Remover foto de perfil"
              legenda="Volta a inicial ou o avatar do Fin."
              perigo
              ocupado={ocupado}
              onClick={() => remover("foto")}
            />
          )}
          <ItemDoMenu
            icone={<IconeCapa className="size-[18px]" />}
            titulo={temBanner ? "Trocar capa" : "Adicionar capa"}
            legenda="A faixa larga no topo do perfil."
            ocupado={ocupado}
            onClick={() => inputBanner.current?.click()}
          />
          {temBanner && (
            <ItemDoMenu
              icone={<Trash2 className="size-[18px]" />}
              titulo="Remover capa"
              legenda="O topo volta a ser liso."
              perigo
              ocupado={ocupado}
              onClick={() => remover("banner")}
            />
          )}
        </div>

        <button
          onClick={fechar}
          className="mt-2 w-full py-3 text-sm font-bold"
          style={{ color: "var(--fin-muted)" }}
        >
          {ocupado ? "Salvando…" : "Fechar"}
        </button>
      </ModalFin>
    </>
  )
}

/** Uma linha do menu, no formato das linhas do ModalEnergia. */
function ItemDoMenu({
  icone,
  titulo,
  legenda,
  perigo = false,
  ocupado,
  onClick,
}: {
  icone: React.ReactNode
  titulo: string
  legenda: string
  perigo?: boolean
  ocupado: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={ocupado}
      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left disabled:opacity-50"
      style={{ background: "var(--fin-surface)" }}
    >
      <span
        className="grid size-9 shrink-0 place-items-center rounded-xl"
        style={
          perigo
            ? { background: "var(--fin-border)", color: "var(--fin-erro)" }
            : { background: "var(--fin-accent)", color: "var(--fin-bg)" }
        }
      >
        {icone}
      </span>
      <span>
        <span
          className="block text-[13.5px] font-black"
          style={{ color: perigo ? "var(--fin-erro)" : "var(--fin-text)" }}
        >
          {titulo}
        </span>
        <span className="block text-[11.5px]" style={{ color: "var(--fin-dim)" }}>
          {legenda}
        </span>
      </span>
    </button>
  )
}
