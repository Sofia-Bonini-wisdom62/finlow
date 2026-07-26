// Tema claro/escuro. Três estados, não dois: "sistema" respeita a preferência
// do SO e continua reagindo se ela mudar; "claro"/"escuro" fixam a escolha.
export type Tema = "sistema" | "claro" | "escuro"

export const CHAVE_TEMA = "finlow:tema"

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
export const SCRIPT_ANTI_FLASH = `(function(){try{var t=localStorage.getItem("${CHAVE_TEMA}");var e=t==="escuro"||(t!=="claro"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(e)document.documentElement.classList.add("dark")}catch(_){}})()`
