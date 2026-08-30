"use client"

import type { ItemLicaoData, RespostaItem } from "@/types/licao-item"
import { ItemBinaria } from "./ItemBinaria"
import { ItemEscolha } from "./ItemEscolha"
import { ItemOrdenar } from "./ItemOrdenar"
import { ItemClassificar } from "./ItemClassificar"
import { ItemEstimativa } from "./ItemEstimativa"

interface Props {
  item: ItemLicaoData
  resposta: RespostaItem | undefined
  onResponder: (r: RespostaItem) => void
}

/** Espelho de `components/trilha/TelaRenderer.tsx`, para os 6 formatos da
 *  base nova. `fecho` reaproveita `ItemEscolha` — mesmo contrato. */
export function ItemRenderer({ item, resposta, onResponder }: Props) {
  switch (item.conteudo.formato) {
    case "binaria":
      return <ItemBinaria conteudo={item.conteudo} resposta={resposta} onResponder={onResponder} />
    case "escolha3":
    case "fecho":
      return <ItemEscolha conteudo={item.conteudo} resposta={resposta} onResponder={onResponder} />
    case "ordenar":
      return <ItemOrdenar conteudo={item.conteudo} resposta={resposta} onResponder={onResponder} />
    case "classificar":
      return <ItemClassificar conteudo={item.conteudo} resposta={resposta} onResponder={onResponder} />
    case "estimativa":
      return <ItemEstimativa conteudo={item.conteudo} resposta={resposta} onResponder={onResponder} />
    default:
      return null
  }
}
