import { redirect } from "next/navigation"

/**
 * O perfil do jogador foi UNIFICADO no /perfil (decisão da fundadora,
 * 15/08/2026): uma pessoa só, uma tela só. Missões, conquistas e o recorde
 * de ofensiva moram lá agora, junto do retrato financeiro.
 *
 * A rota fica como redirect porque o chip da trilha apontou pra cá por dias
 * e link antigo não pode virar 404.
 */
export default function PerfilJogadorPage() {
  redirect("/perfil")
}
