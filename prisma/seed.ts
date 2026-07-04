import { PrismaClient, Prisma } from "@prisma/client"
import { modulosSeeds } from "./modulos-data"

const prisma = new PrismaClient()

async function main() {
  for (const mod of modulosSeeds) {
    await prisma.modulo.upsert({
      where: { slug: mod.slug },
      update: {},
      create: {
        slug: mod.slug,
        titulo: mod.titulo,
        subtitulo: mod.subtitulo,
        tipoPerfil: mod.tipoPerfil,
        ordem: mod.ordem,
        xp: mod.xp,
        telas: {
          create: mod.telas.map((t) => ({
            ordem: t.ordem,
            tipo: t.tipo,
            label: t.label,
            conteudo: t.conteudo as unknown as Prisma.InputJsonValue,
          })),
        },
      },
    })
    console.log(`✓ ${mod.slug} (${mod.telas.length} telas)`)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
