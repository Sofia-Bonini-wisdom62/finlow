import { PrismaClient, Prisma } from "@prisma/client"
import { modulosSeeds } from "./modulos-data"

const prisma = new PrismaClient()

async function main() {
  for (const mod of modulosSeeds) {
    const telas = mod.telas.map((t) => ({
      ordem: t.ordem,
      tipo: t.tipo,
      label: t.label,
      conteudo: t.conteudo as unknown as Prisma.InputJsonValue,
    }))

    // update reescreve as telas — modulos-data.ts é a fonte única de verdade,
    // então rodar o seed de novo sincroniza conteúdo alterado (progresso é
    // por módulo, não por tela, e não é afetado)
    await prisma.modulo.upsert({
      where: { slug: mod.slug },
      update: {
        titulo: mod.titulo,
        subtitulo: mod.subtitulo,
        tipoPerfil: mod.tipoPerfil,
        ordem: mod.ordem,
        xp: mod.xp,
        telas: { deleteMany: {}, create: telas },
      },
      create: {
        slug: mod.slug,
        titulo: mod.titulo,
        subtitulo: mod.subtitulo,
        tipoPerfil: mod.tipoPerfil,
        ordem: mod.ordem,
        xp: mod.xp,
        telas: { create: telas },
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
