import { db } from "@/lib/db"
import { cifrar, decifrar } from "@/lib/cripto"
import { detalheLimpo, ehPersonalidade, PERSONALIDADE_PADRAO } from "@/lib/personalidade"

/**
 * Leitura e gravação da personalidade do assistente.
 *
 * Separado de `lib/personalidade.ts` pelo mesmo motivo que `memoria-repo` é
 * separado da validação em `ia.ts`: o catálogo e o bloco de prompt precisam
 * rodar no teste sem banco, e este arquivo importa `db`.
 *
 * O texto livre é CIFRADO. Ele não é configuração ("tema: escuro"), é a pessoa
 * dizendo como quer ser tratada, e costuma vir com o motivo junto: "sou
 * autônoma", "estou saindo de uma dívida", "meu português é ruim". Isso é da
 * mesma família da memória do assistente, e recebe o mesmo cuidado.
 */

export interface EscolhaPersonalidade {
  id: string
  /** "" quando não há texto livre. Nunca null, para a tela não ter dois vazios. */
  detalhe: string
}

const CAMPO = "personalidade"

/**
 * Lê sem poder derrubar a conversa.
 *
 * O catch cobre um caso concreto e previsível: o código sobe antes de a coluna
 * existir no banco. A trilha de EM já custou uma exposição em produção por
 * inverter uma ordem de deploy (ver `docs/estado-do-produto.md`), e ali o
 * estrago foi visível. Aqui seria pior e mais silencioso: esta função está no
 * caminho de TODA resposta do chat, então uma coluna faltando derrubaria o
 * assistente inteiro para todo mundo, com 502, até alguém rodar `db:push`.
 *
 * Cair no tom padrão é a degradação certa — é a voz que o assistente sempre
 * teve. O log fica alto porque isto nunca deve acontecer em regime.
 */
export async function lerPersonalidade(userId: string): Promise<EscolhaPersonalidade> {
  try {
    const u = await db.user.findUnique({
      where: { id: userId },
      select: { personalidadeIA: true, personalidadeDetalhe: true },
    })

    return {
      id: ehPersonalidade(u?.personalidadeIA) ? u!.personalidadeIA : PERSONALIDADE_PADRAO,
      detalhe: decifrarDetalhe(u?.personalidadeDetalhe, userId),
    }
  } catch (e) {
    console.error(
      "[personalidade] não consegui ler a escolha, respondendo no tom padrão. " +
        "Se isto apareceu logo após um deploy, falta rodar `pnpm db:push`:",
      (e as Error)?.message
    )
    return { id: PERSONALIDADE_PADRAO, detalhe: "" }
  }
}

/**
 * Grava. `id` inválido cai no padrão em vez de 400: a tela só manda id da
 * lista, então um valor estranho aqui é bug nosso ou requisição forjada, e nos
 * dois casos o certo é a pessoa continuar com um assistente que fala.
 *
 * `detalhe` undefined significa "não mexa"; string vazia significa "apague".
 * Sem essa distinção, salvar só o tom limparia o texto sem avisar.
 */
export async function salvarPersonalidade(
  userId: string,
  escolha: { id?: unknown; detalhe?: unknown }
): Promise<EscolhaPersonalidade> {
  const dados: { personalidadeIA?: string; personalidadeDetalhe?: string | null } = {}

  if (escolha.id !== undefined) {
    dados.personalidadeIA = ehPersonalidade(escolha.id)
      ? (escolha.id as string)
      : PERSONALIDADE_PADRAO
  }

  if (escolha.detalhe !== undefined) {
    const limpo = detalheLimpo(escolha.detalhe)
    dados.personalidadeDetalhe = limpo ? cifrar(limpo, userId, CAMPO) : null
  }

  if (Object.keys(dados).length === 0) return lerPersonalidade(userId)

  const u = await db.user.update({
    where: { id: userId },
    data: dados,
    select: { personalidadeIA: true, personalidadeDetalhe: true },
  })

  return {
    id: ehPersonalidade(u.personalidadeIA) ? u.personalidadeIA : PERSONALIDADE_PADRAO,
    detalhe: decifrarDetalhe(u.personalidadeDetalhe, userId),
  }
}

/**
 * Decifra sem poder derrubar a conversa.
 *
 * Aqui o try/catch não é preguiça: este campo é lido no caminho quente do chat,
 * e uma cifra que não abre (chave rotacionada, linha restaurada de backup
 * antigo) tem de custar o texto livre daquela pessoa, não a resposta que ela
 * está esperando. O tom escolhido continua valendo.
 */
function decifrarDetalhe(valor: string | null | undefined, userId: string): string {
  if (!valor) return ""
  try {
    return decifrar(valor, userId, CAMPO)
  } catch (e) {
    console.warn("[personalidade] detalhe ilegível:", (e as Error)?.message)
    return ""
  }
}
