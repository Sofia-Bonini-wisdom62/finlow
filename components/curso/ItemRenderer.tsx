"use client"

import type { ItemCursoData, RespostaItem } from "@/types/curso"
import { ItemBinaria } from "./ItemBinaria"
import { ItemEscolha } from "./ItemEscolha"
import { ItemOrdenar } from "./ItemOrdenar"
import { ItemClassificar } from "./ItemClassificar"
import { ItemEstimativa } from "./ItemEstimativa"

interface Props {
  item: ItemCursoData
  resposta: RespostaItem | undefined
  onResponder: (r: RespostaItem) => void
}

/** Um componente por formato (§4), dirigido pelo JSON de `ItemAvaliativo.conteudo`.
 *  `fecho` reaproveita `ItemEscolha`: é uma escolha3 com papel especial. */
export function ItemRenderer({ item, resposta, onResponder }: Props) {
  const c = item.conteudo
  switch (c.formato) {
    case "binaria":
      return <ItemBinaria conteudo={c} resposta={resposta} onResponder={onResponder} />
    case "escolha3":
    case "fecho":
      return <ItemEscolha conteudo={c} resposta={resposta} onResponder={onResponder} />
    case "ordenar":
      return <ItemOrdenar conteudo={c} resposta={resposta} onResponder={onResponder} />
    case "classificar":
      return <ItemClassificar conteudo={c} resposta={resposta} onResponder={onResponder} />
    case "estimativa":
      return <ItemEstimativa conteudo={c} resposta={resposta} onResponder={onResponder} />
    default:
      return null
  }
}
