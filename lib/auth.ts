import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { COOKIE_INDICACAO, vincularIndicacao } from "@/lib/indicacao"
import { COOKIE_CONVITE, resgatarConvite } from "@/lib/convite-escola"
import { excedeu, limpar, registrar } from "@/lib/limite-taxa"
import {
  LOGIN_POR_EMAIL,
  LOGIN_POR_IP,
  chaveLoginEmail,
  chaveLoginIp,
  ipDaRequisicao,
} from "@/lib/portas-de-conta"

// Google só entra quando as credenciais existirem no .env.local
// (criar em console.cloud.google.com → APIs & Services → Credentials)
const providers = []

providers.push(
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      senha: { label: "Senha", type: "password" },
    },
    /**
     * O teto de tentativas mora AQUI, e não numa camada acima, porque só aqui
     * se sabe se a senha estava certa — e é a FALHA que conta (ver
     * `lib/portas-de-conta.ts`). Uma senha certa perdoa as erradas de antes.
     *
     * Barrado devolve `null`, o mesmo que senha errada, e isso é escolha
     * dupla: a tela não tem como distinguir os dois no fluxo de credenciais do
     * NextAuth, e dizer "você está barrado" entregaria ao atacante o relógio
     * do teto de graça. Quem sente é a pessoa que errou muitas vezes seguidas,
     * e por isso `/login` diz, ao lado do erro, que a entrada esfria sozinha.
     */
    async authorize(credentials, request) {
      const email = credentials?.email as string | undefined
      const senha = credentials?.senha as string | undefined
      if (!email || !senha) return null

      const emailNorm = email.toLowerCase().trim()
      const chaveEmail = chaveLoginEmail(emailNorm)
      if (excedeu(chaveEmail, LOGIN_POR_EMAIL.max, LOGIN_POR_EMAIL.janelaMs)) return null

      // IP desconhecido PULA a regra por IP em vez de jogar todo mundo numa
      // chave comum — balde compartilhado numa porta de login não é atrito,
      // é queda geral no primeiro proxy que esconder o cabeçalho.
      const ip = ipDaRequisicao((request as Request | undefined)?.headers)
      const chaveIp = ip ? chaveLoginIp(ip) : null
      if (chaveIp && excedeu(chaveIp, LOGIN_POR_IP.max, LOGIN_POR_IP.janelaMs)) return null

      const contarFalha = () => {
        registrar(chaveEmail, LOGIN_POR_EMAIL.janelaMs)
        if (chaveIp) registrar(chaveIp, LOGIN_POR_IP.janelaMs)
      }

      const user = await db.user.findUnique({ where: { email: emailNorm } })
      if (!user?.senha) {
        contarFalha()
        return null
      }

      const ok = await bcrypt.compare(senha, user.senha)
      if (!ok) {
        contarFalha()
        return null
      }

      limpar(chaveEmail)
      if (chaveIp) limpar(chaveIp)
      return { id: user.id, email: user.email, name: user.nome }
    },
  })
)

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  trustHost: true, // necessário fora do Vercel (localhost, etc.)
  session: { strategy: "jwt" }, // JWT obrigatório com provider credentials
  pages: {
    signIn: "/login",
  },
  providers,
  events: {
    // Conta criada pelo Google nasce no adapter, não em /api/cadastro — o
    // vínculo de indicação precisa deste segundo gancho, lendo o MESMO cookie.
    // next/headers entra por import dinâmico para este arquivo continuar
    // importável fora de request (scripts de teste importam lib/*).
    async createUser({ user }) {
      try {
        const { cookies } = await import("next/headers")
        const jar = await cookies()
        // Convite de escola tem precedência sobre indicação — a mesma ordem
        // de /api/cadastro. Sem apelido aqui: o fluxo do Google não tem
        // formulário, e a pessoa escolhe em /ranking depois.
        const convite = jar.get(COOKIE_CONVITE)?.value
        let vinculadoAEscola = false
        if (convite && user.id) {
          vinculadoAEscola = (await resgatarConvite(user.id, convite)).ok
        }
        const codigo = jar.get(COOKIE_INDICACAO)?.value
        if (codigo && user.id && !vinculadoAEscola) await vincularIndicacao(user.id, codigo)
      } catch (e) {
        console.error("[auth] vínculo no cadastro Google:", (e as Error)?.message)
      }
    },
  },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
})
