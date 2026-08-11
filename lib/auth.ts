import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { COOKIE_INDICACAO, vincularIndicacao } from "@/lib/indicacao"
import { COOKIE_CONVITE, resgatarConvite } from "@/lib/convite-escola"

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
    async authorize(credentials) {
      const email = credentials?.email as string | undefined
      const senha = credentials?.senha as string | undefined
      if (!email || !senha) return null

      const user = await db.user.findUnique({ where: { email: email.toLowerCase() } })
      if (!user?.senha) return null

      const ok = await bcrypt.compare(senha, user.senha)
      if (!ok) return null

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
