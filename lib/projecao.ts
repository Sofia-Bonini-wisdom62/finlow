/**
 * Projeção de patrimônio — juros compostos com aporte mensal. Pura: sem
 * banco, sem IA, testável com aritmética de papel.
 *
 * A taxa padrão (0,8% a.m., ~10% a.a.) é deliberadamente uma régua
 * conservadora de "se continuar assim", NÃO uma promessa nem uma
 * recomendação de produto — o Finlow explica mecanismo e recomendação é de
 * profissional autorizado pela CVM. A tela que mostrar isto diz de onde a
 * taxa veio.
 */

export const TAXA_PADRAO_MES = 0.008

export interface MarcoProjecao {
  anos: number
  valor: number
}

export interface PontoProjecao {
  rotulo: string
  valor: number
}

const arred = (n: number) => Math.round(n * 100) / 100

/** Valor futuro de um principal + aporte mensal constante, n meses adiante. */
export function valorFuturo(
  principal: number,
  aporteMensal: number,
  meses: number,
  taxaMes: number = TAXA_PADRAO_MES
): number {
  if (meses <= 0) return arred(principal)
  if (taxaMes <= 0) return arred(principal + aporteMensal * meses)
  const fator = Math.pow(1 + taxaMes, meses)
  return arred(principal * fator + aporteMensal * ((fator - 1) / taxaMes))
}

/** Os três números da tela: 1, 5 e 10 anos. */
export function marcosProjecao(
  principal: number,
  aporteMensal: number,
  taxaMes: number = TAXA_PADRAO_MES
): MarcoProjecao[] {
  return [1, 5, 10].map((anos) => ({
    anos,
    valor: valorFuturo(principal, aporteMensal, anos * 12, taxaMes),
  }))
}

/** A curva ano a ano (0..10) para o GraficoLinha. */
export function serieProjecao(
  principal: number,
  aporteMensal: number,
  taxaMes: number = TAXA_PADRAO_MES
): PontoProjecao[] {
  const pontos: PontoProjecao[] = []
  for (let ano = 0; ano <= 10; ano++) {
    pontos.push({
      rotulo: ano === 0 ? "hoje" : `${ano}a`,
      valor: valorFuturo(principal, aporteMensal, ano * 12, taxaMes),
    })
  }
  return pontos
}
