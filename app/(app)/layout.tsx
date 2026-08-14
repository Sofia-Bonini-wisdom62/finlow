import { auth } from "@/lib/auth"
import { registrarDiaAtivo } from "@/lib/ofensiva"

/**
 * Layout das telas logadas. Existe por UM motivo: marcar o dia ativo.
 *
 * A ofensiva conta "dias em que a pessoa usou o app", e usar inclui só abrir e
 * ler — quem entra para conferir o extrato e não mexe em nada usou o app. Por
 * isso a marca não fica pendurada numa ação (concluir lição, lançar gasto):
 * fica aqui, no que roda em toda visualização de página logada.
 *
 * ESPALHAR ISSO SERIA GARANTIR O ESQUECIMENTO. Um `registrarDiaAtivo` copiado
 * em oito páginas é um que falta na nona, e a falha não dá erro: a ofensiva
 * simplesmente não conta o dia em que a pessoa entrou por aquela tela.
 *
 * A única página logada FORA deste grupo é /trilha, que chama direto — está
 * anotado lá.
 *
 * Falha aqui não derruba a tela: ofensiva é enfeite, e ninguém deve perder o
 * acesso ao próprio dinheiro porque um contador de dias não gravou.
 */
export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (session?.user?.id) {
    await registrarDiaAtivo(session.user.id).catch((e) =>
      console.warn("[ofensiva] não registrou o dia:", (e as Error)?.message)
    )
  }
  // `tema-fin` aqui veste TODO o grupo logado de uma vez (protótipo v2): o
  // escopo remapeia os tokens --fl-* em globals.css, então cada tela já nasce
  // navy+dourado sem trocar classe — o refino tela a tela vem por cima.
  return <div className="tema-fin min-h-dvh bg-fl-page">{children}</div>
}
