import type { MetadataRoute } from "next"

/**
 * Manifest mínimo: o Finlow instalável na home do celular.
 *
 * Era item do backlog de UX ("no celular o Finlow vive numa aba, sem ícone na
 * home, remando contra a própria mecânica de ofensiva diária") e entrou junto
 * da fundação do tema Fin. Sem service worker por enquanto — instalável e com
 * cor de tema é o degrau que paga; offline é outra frente.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Finlow",
    short_name: "Finlow",
    description: "Seu dinheiro, enfim claro.",
    start_url: "/chat",
    display: "standalone",
    background_color: "#0C1B21",
    theme_color: "#0C1B21",
    icons: [
      { src: "/logo.png", sizes: "any", type: "image/png" },
    ],
  }
}
