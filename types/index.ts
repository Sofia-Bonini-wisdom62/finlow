import type { TipoPerfil } from "@/lib/perfis"

export type { TipoPerfil }

export interface RespostaDiagnostico {
  perguntaId: number
  letra: string
}

export interface PerfilUsuario {
  tipo: TipoPerfil
  respostas: RespostaDiagnostico[]
}
