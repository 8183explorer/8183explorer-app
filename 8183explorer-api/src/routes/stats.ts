import { Hono } from 'hono'
import { pool } from '../db/client.ts'
import { viemClient } from '../config.ts'
import { getPriceMeta } from '../services/price.ts'

const stats = new Hono()

// GET /health
stats.get('/health', async (c) => {
  let lastBlock = '0'
  let dbOk = true
  try {
    const res = await pool.query<{ value: string }>(
      "SELECT value FROM indexer_state WHERE key = 'last_indexed_block'"
    )
    lastBlock = res.rows[0]?.value ?? '0'
  } catch {
    dbOk = false
  }

  let chainBlock = '0'
  let rpcOk = true
  try {
    chainBlock = (await viemClient.getBlockNumber()).toString()
  } catch {
    rpcOk = false
  }

  const lag = BigInt(chainBlock) - BigInt(lastBlock)

  return c.json({
    status:          dbOk && rpcOk ? 'ok' : 'degraded',
    lastIndexedBlock: lastBlock,
    chainBlock,
    blockLag:        lag.toString(),
    db:              dbOk  ? 'ok' : 'error',
    rpc:             rpcOk ? 'ok' : 'error',
    price:           getPriceMeta(),
    timestamp:       new Date().toISOString(),
  })
})

// GET /api/stats
stats.get('/stats', async (c) => {
  const [agentCount, jobCount, feedbackCount, jobStats, acpStats] = await Promise.all([
    pool.query<{ count: string }>('SELECT COUNT(*) FROM agents'),
    pool.query<{ count: string }>('SELECT COUNT(*) FROM jobs'),
    pool.query<{ count: string }>('SELECT COUNT(*) FROM feedback WHERE is_revoked = false'),
    pool.query<{ status: number; count: string; total_budget: string }>(`
      SELECT status, COUNT(*) as count, COALESCE(SUM(budget_wei::numeric), 0)::text as total_budget
      FROM jobs GROUP BY status
    `),
    // Aggregate ACP external stats
    pool.query<{ total_jobs: string; total_volume: string }>(`
      SELECT
        COALESCE(SUM((external_stats->>'successfulJobCount')::numeric), 0)::text as total_jobs,
        COALESCE(SUM((external_stats->>'grossAgenticAmount')::numeric), 0)::text as total_volume
      FROM agents WHERE source = 'virtuals_acp' AND external_stats IS NOT NULL
    `),
  ])

  const byStatus: Record<string, number> = {}
  let totalVolumeWei = 0n
  for (const row of jobStats.rows) {
    byStatus[row.status] = Number(row.count)
    if (row.status === 3) totalVolumeWei += BigInt(row.total_budget ?? '0')
  }

  const { ethPriceUsd } = getPriceMeta()
  const totalVolumeEth = Number(totalVolumeWei) / 1e18
  const onChainVolumeUsd = Math.round(totalVolumeEth * ethPriceUsd * 100) / 100

  const acpRow = acpStats.rows[0]
  const acpJobCount   = Number(acpRow.total_jobs)
  const acpVolumeUsd  = Math.round(Number(acpRow.total_volume) * 100) / 100

  return c.json({
    totalAgents:    Number(agentCount.rows[0].count),
    totalJobs:      Number(jobCount.rows[0].count) + acpJobCount,
    onChainJobs:    Number(jobCount.rows[0].count),
    acpJobs:        acpJobCount,
    totalFeedback:  Number(feedbackCount.rows[0].count),
    jobsByStatus:   byStatus,
    totalVolumeEth: totalVolumeEth.toFixed(6),
    totalVolumeUsd: onChainVolumeUsd + acpVolumeUsd,
    acpVolumeUsd,
    ethPriceUsd,
  })
})

// GET /api/stats/breakdown
stats.get('/stats/breakdown', async (c) => {
  const [networkRes, categoryRes] = await Promise.all([
    pool.query<{ network: string; count: string }>(`
      SELECT network, COUNT(*) as count FROM agents GROUP BY network ORDER BY count DESC
    `),
    pool.query<{ cat: string; count: string }>(`
      SELECT unnest(categories) as cat, COUNT(*) as count
      FROM agents
      WHERE categories IS NOT NULL AND array_length(categories, 1) > 0
      GROUP BY cat ORDER BY count DESC LIMIT 6
    `),
  ])

  const totalAgents = networkRes.rows.reduce((s, r) => s + Number(r.count), 0)
  const networkBreakdown = networkRes.rows.map(r => ({
    network: r.network,
    count:   Number(r.count),
    pct:     totalAgents > 0 ? Math.round(Number(r.count) / totalAgents * 1000) / 10 : 0,
  }))

  const totalCat = categoryRes.rows.reduce((s, r) => s + Number(r.count), 0)
  const categoryBreakdown = categoryRes.rows.map(r => ({
    name:  r.cat,
    count: Number(r.count),
    pct:   totalCat > 0 ? Math.round(Number(r.count) / totalCat * 1000) / 10 : 0,
  }))

  return c.json({ networkBreakdown, categoryBreakdown })
})

export default stats
