import { NextResponse } from "next/server"
import { MetricServiceClient, protos } from "@google-cloud/monitoring"

type ITimeSeries = protos.google.monitoring.v3.ITimeSeries
type IPoint = protos.google.monitoring.v3.IPoint

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

const LOOKBACK_HOURS = 24
const PREFIX = "aiplatform.googleapis.com/publisher/online_serving"

const COUNTER_METRICS = [
  `${PREFIX}/model_invocation_count`,
  `${PREFIX}/token_count`,
  `${PREFIX}/character_count`,
]

const LATENCY_METRICS = [
  `${PREFIX}/model_invocation_latencies`,
  `${PREFIX}/first_token_latencies`,
]

type SeriesBucket = { labels: Record<string, string>; value: number }

function mensagemErro(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

function getClient() {
  const raw = process.env.GCP_SA_KEY
  if (!raw) throw new Error("GCP_SA_KEY is not set")

  let creds: { project_id: string; client_email: string; private_key: string }
  try {
    creds = JSON.parse(raw)
  } catch {
    throw new Error("GCP_SA_KEY is not valid JSON")
  }

  const client = new MetricServiceClient({
    projectId: creds.project_id,
    credentials: {
      client_email: creds.client_email,
      private_key: creds.private_key,
    },
  })

  return { client, projectId: creds.project_id }
}

function janela() {
  const endMs = Date.now()
  const startMs = endMs - LOOKBACK_HOURS * 3600 * 1000
  return {
    startTime: { seconds: Math.floor(startMs / 1000) },
    endTime: { seconds: Math.floor(endMs / 1000) },
  }
}

// Junta labels de resource e de metric num objeto só, pra não depender de
// saber de antemão quais chaves o Google devolve pra este padrão de uso.
function flattenLabels(series: ITimeSeries): Record<string, string> {
  return {
    ...(series.resource?.labels ?? {}),
    ...(series.metric?.labels ?? {}),
  }
}

// int64 chega como string no cliente GAPIC, então Number() é o caminho normal
// e não uma gambiarra — Long só apareceria com outra config de protobuf.
function pointValue(point: IPoint | null): number {
  const v = point?.value ?? {}
  if (v.int64Value != null) return Number(v.int64Value)
  if (v.doubleValue != null) return Number(v.doubleValue)
  if (v.distributionValue?.mean != null && v.distributionValue?.count != null) {
    return Number(v.distributionValue.mean)
  }
  return 0
}

async function readMetric(
  client: MetricServiceClient,
  projectId: string,
  metricType: string,
  aligner: string,
): Promise<SeriesBucket[]> {
  const [series] = await client.listTimeSeries({
    name: `projects/${projectId}`,
    filter: `metric.type="${metricType}"`,
    interval: janela(),
    aggregation: {
      alignmentPeriod: { seconds: LOOKBACK_HOURS * 3600 },
      perSeriesAligner: aligner as never,
    },
    view: "FULL" as never,
  })

  return (series ?? []).map((s) => ({
    labels: flattenLabels(s),
    value: (s.points ?? []).reduce((acc, p) => acc + pointValue(p), 0),
  }))
}

// Cada leitura vai embrulhada: uma métrica que falha não derruba a resposta.
async function safeRead(
  client: MetricServiceClient,
  projectId: string,
  metricType: string,
  aligner: string,
) {
  try {
    const buckets = await readMetric(client, projectId, metricType, aligner)
    return {
      metric: metricType.replace(`${PREFIX}/`, ""),
      ok: true as const,
      total: buckets.reduce((a, b) => a + b.value, 0),
      series: buckets,
    }
  } catch (err) {
    return {
      metric: metricType.replace(`${PREFIX}/`, ""),
      ok: false as const,
      error: mensagemErro(err),
    }
  }
}

/**
 * Métricas do PRODUTO, direto do banco — a resposta desta rota era só Vertex,
 * e "quantos usuários novos vieram por indicação" não mora no Google.
 * Agregados apenas: nenhum e-mail, nome ou id sai daqui.
 */
async function metricasProduto() {
  try {
    const { db } = await import("@/lib/db")
    const corte30d = new Date(Date.now() - 30 * 24 * 3600 * 1000)
    const [usuarios, usuarios30d, indicados, indicados30d, ativadas] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { criadoEm: { gte: corte30d } } }),
      db.indicacao.count(),
      db.indicacao.count({ where: { criadoEm: { gte: corte30d } } }),
      db.indicacao.count({ where: { status: "ativado" } }),
    ])
    return {
      ok: true as const,
      usuarios: { total: usuarios, novos30d: usuarios30d },
      indicacao: {
        cadastradas: indicados,
        ativadas,
        // % dos usuários que entraram por indicação — na base toda e nos últimos 30 dias
        pctViaIndicacao: usuarios > 0 ? indicados / usuarios : 0,
        pctViaIndicacao30d: usuarios30d > 0 ? indicados30d / usuarios30d : 0,
      },
    }
  } catch (err) {
    return { ok: false as const, error: mensagemErro(err) }
  }
}

export async function GET(request: Request) {
  const expected = process.env.OPS_METRICS_TOKEN
  if (expected) {
    const supplied = new URL(request.url).searchParams.get("token")
    if (supplied !== expected) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }
  }

  const produto = await metricasProduto()

  let conexao: ReturnType<typeof getClient>
  try {
    conexao = getClient()
  } catch (err) {
    // Vertex indisponível não esconde o produto: cada bloco falha sozinho.
    return NextResponse.json(
      { ok: false, error: mensagemErro(err), produto },
      { status: 500 },
    )
  }
  const { client, projectId } = conexao

  const [counters, p50s, p95s] = await Promise.all([
    Promise.all(
      COUNTER_METRICS.map((m) => safeRead(client, projectId, m, "ALIGN_SUM")),
    ),
    Promise.all(
      LATENCY_METRICS.map((m) =>
        safeRead(client, projectId, m, "ALIGN_PERCENTILE_50"),
      ),
    ),
    Promise.all(
      LATENCY_METRICS.map((m) =>
        safeRead(client, projectId, m, "ALIGN_PERCENTILE_95"),
      ),
    ),
  ])

  const invocations = counters.find((c) => c.metric === "model_invocation_count")
  let errorRate: number | null = null
  if (invocations?.ok && invocations.series.length) {
    let total = 0
    let failed = 0
    for (const s of invocations.series) {
      total += s.value
      const code = s.labels.response_code ?? s.labels.error_code ?? ""
      if (/^[45]/.test(String(code))) failed += s.value
    }
    errorRate = total > 0 ? failed / total : 0
  }

  return NextResponse.json({
    ok: true,
    project: projectId,
    windowHours: LOOKBACK_HOURS,
    generatedAt: new Date().toISOString(),
    produto,
    errorRate,
    counters,
    latencyP50Ms: p50s,
    latencyP95Ms: p95s,
  })
}
