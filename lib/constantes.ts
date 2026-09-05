// Único email de contato do Finlow (decisão da fundadora, 23/07/2026)
export const EMAIL_CONTATO = "finlow.app@gmail.com"

/**
 * Mínimo de letras para procurar uma conta em /ops. Menos que isto varre a
 * base inteira num descuido de teclado, e "q=a" seria um vazamento com cara
 * de funcionalidade.
 *
 * Mora aqui, e não em lib/ops-usuario.ts, porque as DUAS PONTAS precisam do
 * mesmo número: a tela desabilita o botão e a rota recusa. Este arquivo é
 * folha — importar o outro de um componente de cliente arrastaria o Prisma
 * para dentro do navegador.
 */
export const MIN_BUSCA_CONTA = 3
