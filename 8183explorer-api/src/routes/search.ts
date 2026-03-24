import { Hono } from 'hono'
import { pool } from '../db/client.ts'
import { calculateTrustScore, calculateTrustScoreFromExternal } from '../services/scorer.ts'
import type { JobRow } from '../services/scorer.ts'

function scoreAgent(
  agent: { source: string; registered_at: string | null; external_stats?: unknown },
  jobs: JobRow[],
) {
  const ext = agent.external_stats as Record<string, unknown> | null | undefined
  if (agent.source === 'virtuals_acp' && ext) {
    return calculateTrustScoreFromExternal(ext, agent.registered_at ? Number(agent.registered_at) : null, agent.source)
  }
  return calculateTrustScore(jobs, agent.registered_at ? Number(agent.registered_at) : null, agent.source)
}

const search = new Hono()

// GET /api/search?q=&category=&minScore=&sort=&page=&limit=
search.get('/', async (c) => {
  const q        = (c.req.query('q') ?? '').trim().toLowerCase()
  const category = c.req.query('category') ?? ''
  const minScore = Number(c.req.query('minScore') ?? 0)
  const sort     = c.req.query('sort') ?? 'score'
  const page     = Math.max(1, Number(c.req.query('page')  ?? 1))
  const limit    = Math.min(100, Number(c.req.query('limit') ?? 20))
  const offset   = (page - 1) * limit

  const params: (string | number)[] = []
  const conditions: string[] = []

  if (q) {
    params.push(`%${q}%`, `%${q}%`)
    conditions.push(`(LOWER(a.name) LIKE $${params.length - 1} OR LOWER(a.description) LIKE $${params.length})`)
  }

  if (category) {
    params.push(category)
    conditions.push(`$${params.length} = ANY(a.categories)`)
  }

  const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''

  const agentsRes = await pool.query<{
    id: number; agent_id: string; network: string; source: string;
    name: string; description: string; image_uri: string | null;
    categories: string[]; wallet_address: string; registered_at: string | null;
    active: boolean; services: string; external_stats?: unknown;
  }>(`SELECT a.id, a.agent_id, a.network, a.source, a.name, a.description, a.image_uri, a.categories,
             a.wallet_address, a.registered_at, a.active, a.services, a.external_stats
      FROM agents a ${where}`, params)

  // Enrich with trust score
  const enriched = await Promise.all(agentsRes.rows.map(async (agent) => {
    let jobs: JobRow[] = []
    if (agent.source !== 'virtuals_acp') {
      const jobsRes = await pool.query<JobRow>(`
        SELECT job_id, client_address, provider_address, status, budget_wei,
               created_at, completed_at, expired_at
        FROM jobs WHERE provider_address = $1
      `, [agent.wallet_address])
      jobs = jobsRes.rows
    }

    const score = scoreAgent(agent, jobs)

    const ext = agent.external_stats as Record<string, unknown> | null | undefined
    const hireUrl = agent.source === 'virtuals_acp' && ext?.documentId
      ? `https://app.virtuals.io/acp/${ext.documentId}`
      : null

    return {
      uid:           agent.id,
      agentId:       agent.agent_id,
      network:       agent.network,
      source:        agent.source,
      name:          agent.name,
      description:   agent.description,
      imageUri:      agent.image_uri,
      categories:    agent.categories,
      walletAddress: agent.wallet_address,
      active:        agent.active,
      services:      typeof agent.services === 'string' ? JSON.parse(agent.services) : agent.services,
      trustScore:    score.totalScore,
      badges:        score.badges,
      redFlags:      score.redFlags,
      stats:         score.stats,
      hireUrl,
    }
  }))

  const filtered = enriched.filter(a => a.trustScore >= minScore)

  if (sort === 'score')       filtered.sort((a, b) => b.trustScore - a.trustScore)
  else if (sort === 'jobs')   filtered.sort((a, b) => b.stats.completedJobs - a.stats.completedJobs)
  else if (sort === 'volume') filtered.sort((a, b) => b.stats.totalVolumeUsd - a.stats.totalVolumeUsd)
  else if (sort === 'recent') filtered.sort((a, b) => b.stats.daysActive - a.stats.daysActive)
  else if (sort === 'name')   filtered.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))

  const total     = filtered.length
  const paginated = filtered.slice(offset, offset + limit)

  return c.json({
    query: { q, category, minScore, sort, page, limit },
    data:  paginated,
    meta:  { total, page, limit, pages: Math.ceil(total / limit) },
  })
})

export default search
