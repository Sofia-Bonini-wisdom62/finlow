import { NextResponse } from "next/server"
import { getUserIdOr401 } from "@/lib/painel"
import { resumoDaAssinatura } from "@/lib/pagamento/acesso"
import { cotaDoMes } from "@/lib/pagamento/tokens"
import { precoDoPlano } from "@/lib/pagamento/preco"

export const dynamic = "force-dynamic"

/**
 * O estado da assinatura e da cota, para as telas.
 *
 * Devolve o veredito já cozido (`premium`, `emAtraso`, `saindoNoFimDoPeriodo`) e
 * não o status cru: tela que recebe status reinterpreta a regra, e a regra mora
 * em `lib/pagamento/acesso.ts`.
 *
 * `teto: null` em vez de `Infinity` porque `Infinity` não sobrevive a JSON —
 * `JSON.stringify(Infinity)` é `null`, e um `null` acidental num campo numérico
 * é o tipo de coisa que a tela lê como zero.
 *
 * `plano` é o preço de tabela, e é OUTRA coisa que `valorCentavos`. Este é o que
 * o checkout vai cobrar de quem ainda não assina; aquele é o que a Stripe já
 * cobrou de quem assina — e podem divergir de propósito, por reajuste ou cupom.
 * Ver `lib/pagamento/preco.ts`.
 */
export async function GET() {
  const userId = await getUserIdOr401()
  if (userId instanceof NextResponse) return userId

  const [assinatura, cota] = await Promise.all([resumoDaAssinatura(userId), cotaDoMes(userId)])

  // Só para quem não é premium. Quem já paga vê o próprio `valorCentavos`, e
  // buscar o preço de tabela para ele seria uma ida à Stripe sem destino na tela.
  const plano = assinatura.premium ? null : await precoDoPlano()

  return NextResponse.json({
    ...assinatura,
    plano,
    cota: {
      usados: cota.usados,
      teto: Number.isFinite(cota.teto) ? cota.teto : null,
      restam: Number.isFinite(cota.restam) ? cota.restam : null,
      podeUsar: cota.podeUsar,
    },
  })
}
