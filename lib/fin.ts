/**
 * O Fin — mascote e vocabulário visual do universo gamificado.
 *
 * Client-safe de propósito (sem db, sem server-only): componentes de tela
 * importam daqui. As poses são PNGs em public/fin/, recortadas das folhas de
 * marca da fundadora (13/08/2026). A regra editorial: o Fin REAGE ao momento
 * — onboarding, acerto, erro, resultado, energia, loja — em vez de ilustração
 * parada. "Não tem imagens" foi a crítica que ele responde.
 */

export const POSE = {
  hi: "/fin/cat-hi.png",
  point: "/fin/cat-point.png",
  fire: "/fin/cat-fire.png",
  cheer: "/fin/cat-cheer.png",
  stars: "/fin/cat-stars.png",
  worried: "/fin/cat-worried.png",
  sad: "/fin/cat-sad.png",
  cry: "/fin/cat-cry.png",
  oops: "/fin/cat-oops.png",
  angry: "/fin/cat-angry.png",
  flex: "/fin/fin-flex.png",
  proud: "/fin/fin-proud.png",
  worry: "/fin/fin-worry2.png",
  determined: "/fin/fin-determined.png",
  teach: "/fin/fin-teach.png",
  search: "/fin/fin-search.png",
  idea: "/fin/fin-idea.png",
  present: "/fin/fin-present.png",
  streak: "/fin/fin-streak.png",
  wow: "/fin/fin-wow.png",
  bill: "/fin/fin-bill.png",
  hi2: "/fin/fin-hi2.png",
  grr: "/fin/fin-grr.png",
  sad2: "/fin/fin-sad2.png",
} as const

export type PoseFin = keyof typeof POSE

export const LOGO_FIN = "/fin/logo-mark.png"

/**
 * A pose de cada avatar comprável (itemIds do catálogo de lib/loja.ts).
 * Mora AQUI e não na loja porque componentes de cliente precisam resolver a
 * imagem do avatar equipado — e lib/loja.ts importa o banco.
 */
export const AVATAR_POSE: Record<string, string> = {
  "avatar-flex": POSE.flex,
  "avatar-fire": POSE.fire,
  "avatar-stars": POSE.stars,
}

/** A pose do resultado, por faixa de precisão (0–100). */
export function poseDoDesempenho(pct: number): string {
  if (pct >= 80) return POSE.stars
  if (pct >= 60) return POSE.cheer
  return POSE.worried
}

/** O título do resultado, na mesma régua — sem culpa, como manda o produto. */
export function tituloDoDesempenho(pct: number): string {
  if (pct >= 80) return "Mandou muito!"
  if (pct >= 60) return "Tá indo super bem!"
  return "Bora revisar juntos?"
}

/**
 * Cor da unidade (bloco) por POSIÇÃO na trilha — estável porque a ordem dos
 * blocos é a do currículo, e sem coluna nova no banco. A trilha adulta tem um
 * bloco só e fica dourada; as escolares alternam a paleta do protótipo.
 */
const CORES_UNIDADE = [
  { cor: "#E9A63C", sombra: "#B97F22" }, // dourado
  { cor: "#58C08A", sombra: "#3B9A6A" }, // verde
  { cor: "#E0745A", sombra: "#B55440" }, // coral
  { cor: "#55C7EA", sombra: "#3D97B5" }, // azul
  { cor: "#8B6CC9", sombra: "#6B4FA3" }, // roxo
] as const

export function corDaUnidade(indice: number): { cor: string; sombra: string } {
  return CORES_UNIDADE[((indice % CORES_UNIDADE.length) + CORES_UNIDADE.length) % CORES_UNIDADE.length]
}
