#!/usr/bin/env tsx
/** Valida todas as lições em licoes/ + a piloto. Checa também repetição de
 *  enunciado entre encontros do mesmo conceito. Não toca no banco. */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { validarLicao, type Licao } from "../lib/licao/validar";
import { custoLicao } from "../lib/licao/formatos";

const DIRS = ["prisma/seeds/licoes"];
const arquivos: string[] = [];
for (const d of DIRS) if (existsSync(d))
  for (const f of readdirSync(d)) if (f.endsWith(".json")) arquivos.push(`${d}/${f}`);

let falhas = 0, ok = 0;
const porConceito = new Map<string, { slug: string; textos: Set<string> }[]>();
const textosDe = (l: Licao) =>
  new Set([...l.telas, ...l.reserva].map((t) => (t.enunciado ?? t.pergunta ?? "").trim().toLowerCase()).filter(Boolean));

for (const f of arquivos.sort()) {
  let l: Licao;
  try { l = JSON.parse(readFileSync(f, "utf8")); }
  catch (e) { falhas++; console.log(`✗ ${f}: JSON inválido — ${(e as Error).message}`); continue; }
  const erros = validarLicao(l);
  if (erros.length) { falhas++; console.log(`✗ ${f} (${erros.length})\n   ` + erros.join("\n   ")); continue; }
  const base = l.slug.replace(/-(reforco|consolida)$/, "");
  const grupo = porConceito.get(base) ?? [];
  const meus = textosDe(l);
  for (const outro of grupo)
    for (const t of meus)
      if (outro.textos.has(t)) { erros.push(`repete enunciado de ${outro.slug}: "${t.slice(0, 60)}"`); }
  if (erros.length) { falhas++; console.log(`✗ ${f}\n   ` + erros.join("\n   ")); continue; }
  grupo.push({ slug: l.slug, textos: meus });
  porConceito.set(base, grupo);
  ok++;
  if (process.argv.includes("--verboso"))
    console.log(`✓ ${f} · ${l.telas.length} telas · ${custoLicao(l.telas.map((t) => t.formato))}s`);
}
console.log(`\n${ok} lições válidas · ${falhas} com problema · ${porConceito.size} conceitos`);
process.exit(falhas ? 1 : 0);
