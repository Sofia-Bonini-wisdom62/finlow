import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const db = new PrismaClient()

const EMAIL = "teste.ofensiva@finlow.dev"
const SENHA = "teste123"

// meia-noite de hoje em São Paulo, como o banco guarda (@db.Date)
function inicioDoDiaSP(agora = new Date()) {
  const dia = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(agora)
  return new Date(`${dia}T00:00:00-03:00`)
}

function diasAtras(n) {
  return new Date(inicioDoDiaSP().getTime() - n * 86_400_000)
}

async function main() {
  const hash = await bcrypt.hash(SENHA, 10)
  const user = await db.user.upsert({
    where: { email: EMAIL },
    update: { senha: hash, nome: "Teste Ofensiva" },
    create: { email: EMAIL, senha: hash, nome: "Teste Ofensiva" },
  })

  // limpa dias antigos deste usuário para o seed ser reprodutível
  await db.diaAtivo.deleteMany({ where: { userId: user.id } })

  // Sequência atual: hoje (0) até 11 dias atrás -> ofensiva = 12
  const atual = []
  for (let i = 0; i <= 11; i++) atual.push(i)

  // Buraco em 12..14 (3 dias em branco)

  // Bloco antigo maior (recorde): 15..37 -> 23 dias seguidos
  const antigo = []
  for (let i = 15; i <= 37; i++) antigo.push(i)

  // alguns dias esparsos ainda mais atrás
  const esparsos = [45, 46, 50, 60, 61, 62]

  const todos = [...atual, ...antigo, ...esparsos]
  await db.diaAtivo.createMany({
    data: todos.map((n) => ({ userId: user.id, dia: diasAtras(n) })),
    skipDuplicates: true,
  })

  console.log(`[seed] usuário: ${EMAIL} / senha: ${SENHA}`)
  console.log(`[seed] dias ativos criados: ${todos.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
