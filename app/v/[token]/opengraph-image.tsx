import { ImageResponse } from "next/og"
import { lerDiagnosticoPublico } from "@/lib/vazamento-repo"

/**
 * A imagem que aparece quando o link /v/{token} é colado no WhatsApp.
 * Mesmo contrato da página: o número e mais nada de pessoal.
 */

export const alt = "Diagnóstico de Vazamento · Finlow"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })

export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const d = await lerDiagnosticoPublico(token)

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0e1a14",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 32, letterSpacing: 4, textTransform: "uppercase", color: "#8aa89a" }}>
          Diagnóstico de Vazamento
        </div>
        <div style={{ fontSize: 120, fontWeight: 800, color: "#22c55e", marginTop: 16 }}>
          {d ? brl(d.totalAnual) : "R$ ?"}
        </div>
        <div style={{ fontSize: 40, color: "#c9d6cf", marginTop: 8 }}>
          por ano escapando sem ninguém ver
        </div>
        <div style={{ fontSize: 30, color: "#8aa89a", marginTop: 48 }}>
          finlow · descubra o seu
        </div>
      </div>
    ),
    size
  )
}
