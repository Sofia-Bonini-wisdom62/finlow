// Os quatro perfis nomeiam as trilhas de conteúdo. Eles NÃO são mais atribuídos
// por quiz: o diagnóstico de 4 perguntas foi aposentado no pivô para adultos, e
// o Perfil Financeiro agora é calculado dos lançamentos reais (lib/financas.ts).
// O que sobrou aqui é o vocabulário usado para rotular e recomendar módulos.
export type TipoPerfil = "lancador" | "guardador" | "impulsivo" | "sonhador"

export const descricoesPerfil: Record<
  TipoPerfil,
  { titulo: string; subtitulo: string; descricao: string; cor: string }
> = {
  lancador: {
    titulo: "Fluxo de caixa",
    subtitulo: "O dinheiro entra e some antes do fim do mês.",
    descricao:
      "Você ganha o suficiente, mas não sabe onde ele foi parar. Essa trilha coloca o mês inteiro na mesa, cria um espaço garantido no dia do salário e protege esse espaço de gasto por impulso.",
    cor: "#2B6D70",
  },
  guardador: {
    titulo: "Guardar e usar",
    subtitulo: "Você guarda bem, falta fazer render e se permitir gastar.",
    descricao:
      "Disciplina você tem de sobra, e isso é raro. Essa trilha trata das duas pontas que faltam: o dinheiro parado que encolhe com a inflação, e a culpa que aparece mesmo quando o gasto era razoável.",
    cor: "#4A7F63",
  },
  impulsivo: {
    titulo: "Compra por impulso",
    subtitulo: "A compra alivia o dia ruim, e a fatura chega depois.",
    descricao:
      "Não é falta de disciplina: é um mecanismo do cérebro buscando alívio rápido. Essa trilha mapeia seu gatilho, instala uma pausa que dispara sozinha e monta uma lista que separa desejo real de falso alarme.",
    cor: "#AA4B3E",
  },
  sonhador: {
    titulo: "Metas e planos",
    subtitulo: "Você tem muitos planos, falta transformá-los em números.",
    descricao:
      "A pós, a viagem, a entrada do apartamento. Essa trilha escolhe um, dá número e prazo a ele, testa se cabe na sua renda real e cria o ritual que impede a empolgação de virar abandono.",
    cor: "#B8863C",
  },
}
