// Tema claro/escuro. Três estados, não dois: "sistema" respeita a preferência
// do SO e continua reagindo se ela mudar; "claro"/"escuro" fixam a escolha.
export type Tema = "sistema" | "claro" | "escuro"

export const CHAVE_TEMA = "finlow:tema"
export const CHAVE_PALETA = "finlow:paleta"

/**
 * Cor de destaque. Só a rampa de destaque muda entre elas; fundo, texto e
 * superfícies são as mesmas. Trocar tudo daria três apps diferentes.
 */
export type Paleta = "teal" | "terracota" | "indigo"

export const PALETAS: { valor: Paleta; rotulo: string; amostraClaro: string; amostraEscuro: string }[] = [
  { valor: "teal", rotulo: "Verde-petróleo", amostraClaro: "#2B6D70", amostraEscuro: "#5FA7A9" },
  { valor: "terracota", rotulo: "Terracota", amostraClaro: "#9F4B31", amostraEscuro: "#C58F7E" },
  { valor: "indigo", rotulo: "Índigo", amostraClaro: "#5E4ED4", amostraEscuro: "#9B94D7" },
]

export function paletaValida(v: unknown): Paleta {
  return v === "terracota" || v === "indigo" ? v : "teal"
}

export function lerPaleta(): Paleta {
  if (typeof window === "undefined") return "teal"
  try {
    return paletaValida(localStorage.getItem(CHAVE_PALETA))
  } catch {
    return "teal"
  }
}

/** Aplica no <html>. "teal" remove o atributo: é o padrão do :root. */
export function aplicarPaleta(paleta: Paleta) {
  const html = document.documentElement
  html.classList.add("trocando-tema")
  if (paleta === "teal") html.removeAttribute("data-paleta")
  else html.setAttribute("data-paleta", paleta)
  requestAnimationFrame(() => requestAnimationFrame(() => html.classList.remove("trocando-tema")))
}

export function salvarPaleta(paleta: Paleta) {
  try {
    if (paleta === "teal") localStorage.removeItem(CHAVE_PALETA)
    else localStorage.setItem(CHAVE_PALETA, paleta)
  } catch {
    // sem persistência: vale só para esta sessão
  }
}

export function temaValido(v: unknown): Tema {
  return v === "claro" || v === "escuro" ? v : "sistema"
}

export function lerTema(): Tema {
  if (typeof window === "undefined") return "sistema"
  try {
    return temaValido(localStorage.getItem(CHAVE_TEMA))
  } catch {
    // localStorage pode estourar em modo privado/bloqueado — cai no padrão
    return "sistema"
  }
}

export function prefereEscuro(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches
}

export function escuroEfetivo(tema: Tema): boolean {
  return tema === "escuro" || (tema === "sistema" && prefereEscuro())
}

/** Aplica no <html>. A classe `trocando-tema` suprime transições durante a troca. */
export function aplicarTema(tema: Tema) {
  const html = document.documentElement
  html.classList.add("trocando-tema")
  html.classList.toggle("dark", escuroEfetivo(tema))
  // dois frames: um para o browser pintar sem transição, outro para religá-las
  requestAnimationFrame(() => requestAnimationFrame(() => html.classList.remove("trocando-tema")))
}

export function salvarTema(tema: Tema) {
  try {
    if (tema === "sistema") localStorage.removeItem(CHAVE_TEMA)
    else localStorage.setItem(CHAVE_TEMA, tema)
  } catch {
    // sem persistência: o tema vale só para esta sessão
  }
}

/**
 * Script que roda ANTES da primeira pintura, injetado no <head>.
 * Sem ele, quem escolheu escuro vê um flash branco em cada carregamento —
 * o React só hidrata depois de o HTML já estar na tela.
 */
export const SCRIPT_ANTI_FLASH = `(function(){try{var d=document.documentElement;var t=localStorage.getItem("${CHAVE_TEMA}");var e=t==="escuro"||(t!=="claro"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(e)d.classList.add("dark");var p=localStorage.getItem("${CHAVE_PALETA}");if(p==="terracota"||p==="indigo")d.setAttribute("data-paleta",p)}catch(_){}})()`
