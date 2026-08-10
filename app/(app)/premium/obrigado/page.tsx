"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Check, Loader2 } from "lucide-react"

/**
 * Depois do pagamento.
 *
 * ESTA TELA NÃO LIBERA ACESSO. Ela só PERGUNTA se já liberou.
 * Chegar aqui significa que a Stripe redirecionou o navegador, e navegador é
 * coisa que qualquer pessoa consegue apontar para qualquer URL. Quem promove
 * alguém a premium é o webhook, do lado do servidor, com assinatura verificada.
 * Se esta tela escrevesse no banco, o produto sairia de graça para quem
 * digitasse /premium/obrigado na barra de endereço.
 *
 * POR QUE ELA FICA PERGUNTANDO
 * O webhook é assíncrono: o redirecionamento costuma ganhar a corrida contra o
 * evento por um ou dois segundos. Sem a consulta repetida, a pessoa que acabou
 * de pagar veria "ainda não" e concluiria que perdeu o dinheiro. Então a tela
 * espera — e se depois de ~20s ainda não chegou, diz o que fazer em vez de
 * girar para sempre.
 */

const INTERVALO_MS = 1500
const TENTATIVAS = 14 // ~21s

export default function ObrigadoPage() {
  const [confirmado, setConfirmado] = useState(false)
  const [desistiu, setDesistiu] = useState(false)
  const tentativas = useRef(0)

  useEffect(() => {
    let vivo = true
    let timer: ReturnType<typeof setTimeout>

    async function perguntar() {
      if (!vivo) return
      try {
        const r = await fetch("/api/pagamento/assinatura")
        const j = await r.json()
        if (!vivo) return
        if (j?.premium) {
          setConfirmado(true)
          return
        }
      } catch {
        // Rede instável não é motivo para desistir: a próxima tentativa resolve.
      }
      tentativas.current += 1
      if (tentativas.current >= TENTATIVAS) {
        setDesistiu(true)
        return
      }
      timer = setTimeout(perguntar, INTERVALO_MS)
    }

    void perguntar()
    return () => {
      vivo = false
      clearTimeout(timer)
    }
  }, [])

  return (
    <main className="min-h-screen bg-fl-page">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
        {confirmado ? (
          <>
            <div className="flex size-14 items-center justify-center rounded-full bg-fl-500/15">
              <Check className="size-7 text-fl-500" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold text-fl-ink">Pronto, é seu.</h1>
            <p className="mt-2 text-sm text-fl-ink/70">
              A assinatura está ativa. Pode conversar sem contar mensagem.
            </p>
            <Link
              href="/chat"
              className="mt-7 rounded-xl bg-fl-500 px-6 py-3 text-base font-medium text-white"
            >
              Ir para o assistente
            </Link>
          </>
        ) : desistiu ? (
          <>
            {/* Nem "deu certo" nem "deu errado": a verdade é que ainda não deu
                para confirmar. Dizer "falhou" a quem acabou de pagar é pior que
                dizer "estou conferindo". */}
            <h1 className="text-2xl font-semibold text-fl-ink">Pagamento recebido</h1>
            <p className="mt-2 text-sm text-fl-ink/70">
              A confirmação do banco está demorando um pouco mais que o normal. Isso costuma se
              resolver em alguns minutos, e não é preciso pagar de novo.
            </p>
            <Link
              href="/premium"
              className="mt-7 rounded-xl border border-fl-sand bg-fl-card px-6 py-3 text-base font-medium text-fl-ink"
            >
              Ver minha assinatura
            </Link>
          </>
        ) : (
          <>
            <Loader2 className="size-6 animate-spin text-fl-ink/40" />
            <h1 className="mt-5 text-xl font-semibold text-fl-ink">Confirmando com o banco…</h1>
            <p className="mt-2 text-sm text-fl-ink/60">Só um instante.</p>
          </>
        )}
      </div>
    </main>
  )
}
