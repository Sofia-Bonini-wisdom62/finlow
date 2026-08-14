import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { COOKIE_INDICACAO, vincularIndicacao } from "@/lib/indicacao"
import { COOKIE_CONVITE, resgatarConvite } from "@/lib/convite-escola"
import { apelidoValido } from "@/lib/pontos"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const { nome, email, senha, dataNascimento, apelido, celular } = await req.json()

    if (!nome || typeof nome !== "string" || nome.trim().length < 2) {
      return NextResponse.json({ error: "Me diz seu nome" }, { status: 400 })
    }
    if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 })
    }
    if (!senha || typeof senha !== "string" || senha.length < 6) {
      return NextResponse.json({ error: "Senha precisa de pelo menos 6 caracteres" }, { status: 400 })
    }

    // Celular é opcional e informativo, como a data de nascimento (protótipo
    // v2, 14/08/2026): plausível = 10 ou 11 dígitos; fora disso, descarta em
    // silêncio — cadastro nunca trava por telefone.
    let celularLimpo: string | null = null
    if (typeof celular === "string") {
      const digitos = celular.replace(/\D/g, "")
      if (digitos.length === 10 || digitos.length === 11) celularLimpo = digitos
    }

    // data de nascimento é só informativa — sem validação de faixa etária
    // (decisão da fundadora, 04/07/2026). Só checa se é uma data plausível.
    let nascimento: Date | null = null
    if (dataNascimento) {
      const d = new Date(dataNascimento)
      const ano = d.getFullYear()
      if (isNaN(d.getTime()) || ano < 1900 || d > new Date()) {
        return NextResponse.json({ error: "Data de nascimento inválida" }, { status: 400 })
      }
      nascimento = d
    }

    const emailNorm = email.toLowerCase().trim()

    const existe = await db.user.findUnique({ where: { email: emailNorm } })
    if (existe) {
      return NextResponse.json({ error: "Esse email já tem conta. Tenta entrar!" }, { status: 409 })
    }

    const hash = await bcrypt.hash(senha, 10)

    /**
     * A conta nasce SEM perfil, e isso é a correção de um vazamento entre
     * contas.
     *
     * O cadastro aceitava um `perfilTipo` vindo do cliente, herdado de quando
     * existia um diagnóstico de 4 perguntas ANTES do login. Esse diagnóstico
     * foi aposentado no pivô: hoje o perfil é inferido na primeira conversa,
     * DEPOIS do cadastro (`/api/onboarding`). O que sobrava no `localStorage`
     * na hora de criar conta só podia ser de outra pessoa que usou o mesmo
     * navegador — e ela entrava com o perfil de um estranho.
     */
    const novo = await db.user.create({
      data: {
        nome: nome.trim(),
        email: emailNorm,
        senha: hash,
        dataNascimento: nascimento,
        celular: celularLimpo,
      },
    })

    // Convite de escola primeiro (cookie de /convite/{codigo}): se a pessoa
    // chegou por um convite, é a escola que explica esta conta existir — a
    // indicação não roda por cima. Falha aqui não derruba o cadastro: a conta
    // é o produto, o vínculo é acessório. A tela só precisa saber se deu.
    const codigoConvite = req.cookies.get(COOKIE_CONVITE)?.value
    let escolaVinculada = false
    let escolaPapel: string | null = null
    let escolaMotivo: string | null = null
    if (codigoConvite) {
      try {
        let apelidoLimpo: string | null = null
        if (typeof apelido === "string" && apelido.trim()) {
          const v = apelidoValido(apelido)
          if (v.ok) apelidoLimpo = v.apelido
          // apelido ruim não trava cadastro nem matrícula — escolhe outro depois
        }
        const r = await resgatarConvite(novo.id, codigoConvite, apelidoLimpo)
        escolaVinculada = r.ok
        escolaPapel = r.ok ? r.papel : null
        escolaMotivo = r.ok ? null : r.motivo
      } catch (e) {
        console.error("[cadastro] convite de escola:", (e as Error)?.message)
        escolaMotivo = "erro"
      }
    }

    // Apelido do cadastro SEM convite (o resgate cuida do caso com convite):
    // best-effort, como lá — apelido em conflito não trava conta nova.
    if (!codigoConvite && typeof apelido === "string" && apelido.trim()) {
      const v = apelidoValido(apelido)
      if (v.ok) {
        await db.user
          .update({ where: { id: novo.id }, data: { apelido: v.apelido } })
          .catch(() => {})
      }
    }

    // Cookie plantado por /r/{codigo}. Só quando NÃO houve escola: quem entra
    // por convite de turma não é "indicado" de ninguém.
    const codigoRef = req.cookies.get(COOKIE_INDICACAO)?.value
    if (codigoRef && !escolaVinculada) {
      try {
        await vincularIndicacao(novo.id, codigoRef)
      } catch (e) {
        console.error("[cadastro] indicação:", (e as Error)?.message)
      }
    }

    const res = NextResponse.json({ ok: true, escolaVinculada, escolaPapel, escolaMotivo })
    // Consumidos, somem — vinculados ou não. Deixar cookie vivo faria a
    // PRÓXIMA conta criada neste navegador cair na mesma escola ou no mesmo
    // indicador sem ninguém clicar.
    if (codigoConvite) res.cookies.delete(COOKIE_CONVITE)
    if (codigoRef) res.cookies.delete(COOKIE_INDICACAO)
    return res
  } catch (e) {
    console.error("[cadastro]", e)
    return NextResponse.json({ error: "Erro ao criar conta. Tenta de novo?" }, { status: 500 })
  }
}
