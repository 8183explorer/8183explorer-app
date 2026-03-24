import { Hono } from 'hono'
import { formatEther } from 'viem'
import { pool } from '../db/client.ts'
import { calculateTrustScore, calculateTrustScoreFromExternal } from '../services/scorer.ts'
import { getEthPriceUsd } from '../services/price.ts'
import type { JobRow } from '../services/scorer.ts'

/** Pick the right scorer based on agent source */
function scoreAgent(
  agent: { source: string; wallet_address: string; registered_at: string | null; external_stats?: unknown },
  jobs: JobRow[],
) {
  const ext = agent.external_stats as Record<string, unknown> | null | undefined
  if (agent.source === 'virtuals_acp' && ext) {
    return calculateTrustScoreFromExternal(ext, agent.registered_at ? Number(agent.registered_at) : null, agent.source)
  }
  return calculateTrustScore(jobs, agent.registered_at ? Number(agent.registered_at) : null, agent.source)
}

const agents = new Hono()

// ── GET /api/agents ───────────────────────────────────────────────────────────

agents.get('/', async (c) => {
  const page     = Math.max(1, Number(c.req.query('page')     ?? 1))
  const limit    = Math.min(100, Math.max(1, Number(c.req.query('limit') ?? 20)))
  const offset   = (page - 1) * limit
  const category = c.req.query('category') ?? ''
  const minScore = Number(c.req.query('minScore') ?? 0)
  const sort     = c.req.query('sort') ?? 'score'   // score | name | jobs | date

  let whereClause = 'WHERE 1=1'
  const params: (string | number)[] = []

  if (category) {
    params.push(category)
    whereClause += ` AND $${params.length} = ANY(a.categories)`
  }

  const orderMap: Record<string, string> = {
    score: 'trust_score DESC',
    name:  'a.name ASC',
    jobs:  'completed_jobs DESC',
    date:  'a.registered_at DESC',
  }
  const orderBy = orderMap[sort] ?? 'trust_score DESC'

  // Fetch all matching agents (we calculate score in app layer)
  const res = await pool.query<{
    id: number; agent_id: string; network: string; source: string;
    name: string; description: string; image_uri: string | null;
    categories: string[]; wallet_address: string; owner_address: string; registered_at: string | null;
    active: boolean; services: string;
  }>(`
    SELECT a.id, a.agent_id, a.network, a.source, a.name, a.description, a.image_uri, a.categories,
           a.wallet_address, a.owner_address, a.registered_at, a.active, a.services, a.external_stats
    FROM agents a
    ${whereClause}
  `, params)

  // Enrich with trust score
  const enriched = await Promise.all(res.rows.map(async (agent) => {
    let jobs: JobRow[] = []
    if (agent.source !== 'virtuals_acp') {
      const jobsRes = await pool.query<JobRow>(`
        SELECT job_id, client_address, provider_address, status, budget_wei,
               created_at, completed_at, expired_at
        FROM jobs
        WHERE provider_address = $1
      `, [agent.wallet_address])
      jobs = jobsRes.rows
    }

    const score = scoreAgent(agent, jobs)

    const ext = agent.external_stats as Record<string, unknown> | null | undefined
    const hireUrl = agent.source === 'virtuals_acp' && ext?.documentId
      ? `https://app.virtuals.io/acp/${ext.documentId}`
      : null

    return {
      uid:          agent.id,
      agentId:      agent.agent_id,
      network:      agent.network,
      source:       agent.source,
      name:         agent.name,
      description:  agent.description,
      imageUri:     agent.image_uri,
      categories:   agent.categories,
      walletAddress: agent.wallet_address,
      ownerAddress: agent.owner_address,
      active:       agent.active,
      services:     typeof agent.services === 'string' ? JSON.parse(agent.services) : agent.services,
      trustScore:   score.totalScore,
      badges:       score.badges,
      redFlags:     score.redFlags,
      stats:        score.stats,
      hireUrl,
    }
  }))

  // Filter by minScore after calculation
  const filtered = enriched.filter(a => a.trustScore >= minScore)

  // Sort
  if (sort === 'score')     filtered.sort((a, b) => b.trustScore - a.trustScore)
  else if (sort === 'jobs') filtered.sort((a, b) => b.stats.completedJobs - a.stats.completedJobs)
  else if (sort === 'name') filtered.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))

  const total    = filtered.length
  const paginated = filtered.slice(offset, offset + limit)

  return c.json({
    data:  paginated,
    meta:  { total, page, limit, pages: Math.ceil(total / limit) },
  })
})

// ── GET /api/agents/:id ───────────────────────────────────────────────────────

agents.get('/:id', async (c) => {
  const uid = c.req.param('id')

  const agentRes = await pool.query(`
    SELECT * FROM agents WHERE id = $1
  `, [uid])

  if (agentRes.rows.length === 0) {
    return c.json({ error: 'Agent not found' }, 404)
  }

  const agent = agentRes.rows[0]

  let agentJobs: JobRow[] = []
  if (agent.source !== 'virtuals_acp') {
    const jobsRes = await pool.query<JobRow>(`
      SELECT job_id, client_address, provider_address, status, budget_wei,
             created_at, completed_at, expired_at
      FROM jobs WHERE provider_address = $1
      ORDER BY created_at DESC
    `, [agent.wallet_address])
    agentJobs = jobsRes.rows
  }

  const feedbackRes = await pool.query(`
    SELECT * FROM feedback WHERE agent_id = $1 AND is_revoked = false
    ORDER BY given_at DESC
  `, [agent.agent_id])

  const score = scoreAgent(agent, agentJobs)

  return c.json({
    uid:          agent.id,
    agentId:      agent.agent_id,
    network:      agent.network,
    source:       agent.source,
    uri:          agent.uri,
    name:         agent.name,
    description:  agent.description,
    imageUri:     agent.image_uri,
    categories:   agent.categories,
    services:     typeof agent.services === 'string' ? JSON.parse(agent.services) : agent.services,
    active:       agent.active,
    walletAddress: agent.wallet_address,
    ownerAddress: agent.owner_address,
    registeredAt: agent.registered_at,
    trustScore:   score.totalScore,
    scoreBreakdown: {
      jobScore:     score.jobScore,
      successScore: score.successScore,
      volumeScore:  score.volumeScore,
      ageScore:     score.ageScore,
      bonusScore:   score.bonusScore,
      penalties:    score.penalties,
    },
    badges:    score.badges,
    redFlags:  score.redFlags,
    stats:     score.stats,
    reputationSummary: {
      count:        feedbackRes.rows.length,
      averageScore: feedbackRes.rows.length > 0
        ? Math.round(feedbackRes.rows.reduce((s: number, f: any) =>
            s + Number(f.value) / Math.pow(10, f.value_decimals), 0
          ) / feedbackRes.rows.length * 100) / 100
        : 0,
    },
  })
})

// ── GET /api/agents/:id/jobs ──────────────────────────────────────────────────

agents.get('/:id/jobs', async (c) => {
  const uid   = c.req.param('id')
  const page  = Math.max(1, Number(c.req.query('page')  ?? 1))
  const limit = Math.min(100, Number(c.req.query('limit') ?? 20))
  const offset = (page - 1) * limit

  const agentRes = await pool.query('SELECT wallet_address FROM agents WHERE id = $1', [uid])
  if (agentRes.rows.length === 0) return c.json({ error: 'Agent not found' }, 404)

  const wallet = agentRes.rows[0].wallet_address

  const countRes = await pool.query('SELECT COUNT(*) FROM jobs WHERE provider_address = $1', [wallet])
  const total    = Number(countRes.rows[0].count)

  const jobsRes = await pool.query(`
    SELECT * FROM jobs WHERE provider_address = $1
    ORDER BY created_at DESC LIMIT $2 OFFSET $3
  `, [wallet, limit, offset])

  const ethPrice = getEthPriceUsd()
  const enrichedJobs = jobsRes.rows.map((job: any) => {
    const budgetEth = parseFloat(formatEther(BigInt(job.budget_wei ?? '0')))
    return {
      ...job,
      budget_usd: Math.round(budgetEth * ethPrice * 100) / 100,
    }
  })

  return c.json({
    data: enrichedJobs,
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  })
})

// ── GET /api/agents/:id/reputation ───────────────────────────────────────────

agents.get('/:id/reputation', async (c) => {
  const uid = c.req.param('id')

  const agentRes = await pool.query('SELECT agent_id FROM agents WHERE id = $1', [uid])
  if (agentRes.rows.length === 0) return c.json({ error: 'Agent not found' }, 404)
  const agentId = agentRes.rows[0].agent_id

  const feedbackRes = await pool.query(`
    SELECT * FROM feedback WHERE agent_id = $1
    ORDER BY given_at DESC
  `, [agentId])

  const active   = feedbackRes.rows.filter((f: any) => !f.is_revoked)
  const avgScore = active.length > 0
    ? active.reduce((s: number, f: any) => s + Number(f.value) / Math.pow(10, f.value_decimals), 0) / active.length
    : 0

  return c.json({
    count:         active.length,
    averageScore:  Math.round(avgScore * 100) / 100,
    uniqueClients: new Set(active.map((f: any) => f.client_address)).size,
    feedback:      feedbackRes.rows,
  })
})

// ── GET /api/agents/:id/audit ─────────────────────────────────────────────────

agents.get('/:id/audit', async (c) => {
  const uid = c.req.param('id')

  const agentRes = await pool.query('SELECT * FROM agents WHERE id = $1', [uid])
  if (agentRes.rows.length === 0) return c.json({ error: 'Agent not found' }, 404)

  const agent = agentRes.rows[0]

  const feedbackRes = await pool.query(`SELECT * FROM feedback WHERE agent_id = $1`, [agent.agent_id])

  let auditJobs: JobRow[] = []
  if (agent.source !== 'virtuals_acp') {
    const jobsRes = await pool.query<JobRow>(`
      SELECT job_id, client_address, provider_address, status, budget_wei,
             created_at, completed_at, expired_at
      FROM jobs WHERE provider_address = $1
    `, [agent.wallet_address])
    auditJobs = jobsRes.rows
  }

  const score = scoreAgent(agent, auditJobs)

  const activeFeedback = feedbackRes.rows.filter((f: any) => !f.is_revoked)
  const avgScore = activeFeedback.length > 0
    ? activeFeedback.reduce((s: number, f: any) => s + Number(f.value) / Math.pow(10, f.value_decimals), 0) / activeFeedback.length
    : 0

  // Risk level
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW'
  if (score.redFlags.includes('SYBIL_PATTERN') || score.redFlags.includes('WASH_TRADING')) riskLevel = 'CRITICAL'
  else if (score.redFlags.length >= 2) riskLevel = 'HIGH'
  else if (score.redFlags.length === 1) riskLevel = 'MEDIUM'

  return c.json({
    generatedAt: new Date().toISOString(),
    agent: {
      uid:          agent.id,
      agentId:      agent.agent_id,
      network:      agent.network,
      name:         agent.name,
      description:  agent.description,
      uri:          agent.uri,
      walletAddress: agent.wallet_address,
      ownerAddress: agent.owner_address,
      registeredAt: agent.registered_at,
    },
    trustScore: score.totalScore,
    riskLevel,
    scoreBreakdown: {
      jobScore:       score.jobScore,
      successScore:   score.successScore,
      volumeScore:    score.volumeScore,
      ageScore:       score.ageScore,
      bonusScore:     score.bonusScore,
      bonusBreakdown: score.bonusBreakdown,
      penalties:      score.penalties,
    },
    badges:   score.badges,
    redFlags: score.redFlags,
    stats:    score.stats,
    reputation: {
      totalFeedback:  feedbackRes.rows.length,
      activeFeedback: activeFeedback.length,
      revokedFeedback: feedbackRes.rows.length - activeFeedback.length,
      averageScore:   Math.round(avgScore * 100) / 100,
      uniqueClients:  new Set(activeFeedback.map((f: any) => f.client_address)).size,
    },
    recentJobs: auditJobs
      .sort((a, b) => Number(b.created_at ?? 0) - Number(a.created_at ?? 0))
      .slice(0, 10),
  })
})

export default agents
