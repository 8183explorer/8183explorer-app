/**
 * 8183Explorer API client
 * All data now served from 8183explorer-api (indexed PostgreSQL)
 * instead of direct RPC calls.
 */

export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export async function apiFetch(path) {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) {
    let msg = `API ${res.status}`
    try { msg = (await res.json()).error ?? msg } catch {}
    throw new Error(msg)
  }
  return res.json()
}

// ── Penalty map (flag string → point deduction) ───────────────────────────────
export const PENALTY_MAP = {
  SYBIL_PATTERN:    50,
  WASH_TRADING:     30,
  HIGH_REJECT_RATE: 20,
  HIGH_EXPIRED_RATE:15,
  INACTIVE:         10,
}

const JOB_STATUS = {
  0: 'Open', 1: 'Funded', 2: 'Submitted',
  3: 'Completed', 4: 'Rejected', 5: 'Expired',
}

// ── Normalizers ───────────────────────────────────────────────────────────────

/** List item shape (used by SearchResultsPage / DatabasePage) */
export function normalizeAgentSummary(a) {
  const stats = a.stats ?? {}
  return {
    uid:         a.uid ?? a.agentId,   // serial DB id — use for routing
    agentId:     a.agentId,
    network:     a.network ?? 'base_sepolia',
    source:      a.source  ?? 'local',
    name:        a.name,
    description: a.description,
    imageUri:    a.imageUri,
    categories:  a.categories  ?? [],
    wallet:      a.walletAddress,
    services:    a.services    ?? [],
    active:      a.active,
    trustScore:  a.trustScore  ?? 0,
    badges:      a.badges      ?? [],
    redFlags:    a.redFlags    ?? [],
    stats,
    // Flat aliases for DatabasePage / SearchResultsPage
    totalJobs:   stats.totalJobs    ?? 0,
    successRate: (stats.successRate ?? 0) / 100,   // 0–1 (pages multiply by 100 for %)
    totalVolume: String(stats.totalVolumeUsd ?? '0'),
  }
}

/** Full agent shape (used by AgentDetailPage) */
export function normalizeAgentDetail(a) {
  const sb  = a.scoreBreakdown ?? {}
  const st  = a.stats          ?? {}

  return {
    uid:         a.uid ?? a.agentId,
    agentId:     a.agentId,
    network:     a.network ?? 'base_sepolia',
    source:      a.source  ?? 'local',
    name:        a.name,
    description: a.description,
    imageUri:    a.imageUri,
    categories:  a.categories  ?? [],
    wallet:      a.walletAddress,
    walletFull:  a.walletAddress ?? '',
    services:    a.services    ?? [],
    active:      a.active,
    uri:         a.uri,

    // trustScore as object — matches AgentDetailPage's `ts.totalScore`, `ts.badges`, etc.
    trustScore: {
      totalScore:   a.trustScore ?? 0,
      badges:       a.badges  ?? [],
      redFlags:     (a.redFlags ?? []).map(f => ({ flag: f, penalty: PENALTY_MAP[f] ?? 0 })),
      daysActive:   st.daysActive    ?? 0,
      jobScore:     sb.jobScore      ?? 0,
      successScore: sb.successScore  ?? 0,
      volumeScore:  sb.volumeScore   ?? 0,
      ageScore:     sb.ageScore      ?? 0,
      bonusScore:   sb.bonusScore    ?? 0,
    },

    // jobStats — successRate as 0–1 (API returns 0–100)
    jobStats: {
      totalJobs:      st.totalJobs      ?? 0,
      completedJobs:  st.completedJobs  ?? 0,
      rejectedJobs:   st.rejectedJobs   ?? 0,
      expiredJobs:    st.expiredJobs    ?? 0,
      successRate:    (st.successRate   ?? 0) / 100,
      totalVolumeUsd: String(st.totalVolumeUsd ?? '0'),
      avgJobSizeUsd:  '0',
      uniqueClients:  st.uniqueClients  ?? 0,
      jobs: [],   // populated separately via /api/agents/:id/jobs
    },

    reputation: a.reputationSummary ?? { count: 0, averageScore: 0 },
  }
}

/** Job row from /api/agents/:id/jobs → component shape */
export function normalizeJob(j) {
  return {
    jobId:       j.job_id,
    client:      j.client_address,
    provider:    j.provider_address,
    evaluator:   j.evaluator_address,
    description: j.description,
    budget:      BigInt(j.budget_wei ?? '0'),
    budgetEth:   (Number(j.budget_wei ?? '0') / 1e18).toFixed(6),
    budgetUsd:   j.budget_usd != null ? `$${Number(j.budget_usd).toFixed(2)}` : '0',
    expiredAt:   j.expired_at ? new Date(Number(j.expired_at) * 1000) : null,
    status:      Number(j.status),
    statusName:  JOB_STATUS[Number(j.status)] ?? 'Unknown',
    createdAt:   j.created_at ? new Date(Number(j.created_at) * 1000) : null,
    completedAt: j.completed_at ? new Date(Number(j.completed_at) * 1000) : null,
  }
}

/** Audit report from /api/agents/:id/audit → AuditReportPage shape */
export function normalizeAuditReport(r) {
  const score  = r.trustScore   ?? 0
  const stats  = r.stats        ?? {}
  const sb     = r.scoreBreakdown ?? {}
  const flags  = r.redFlags     ?? []
  const agent  = r.agent        ?? {}
  const rep    = r.reputation   ?? {}

  const recommendation = score >= 80
    ? 'HIGH CONFIDENCE. Agent demonstrates strong track record. Suitable for high-value engagements.'
    : score >= 60
    ? 'MODERATE CONFIDENCE. Agent shows acceptable performance. Recommended for standard engagements.'
    : score >= 40
    ? 'CAUTION ADVISED. Agent has mixed signals. Limit exposure and monitor closely.'
    : 'HIGH RISK. Insufficient track record or active red flags detected. Do not engage without further verification.'

  const maxRecommendedJobValue = score >= 80 ? 50_000 : score >= 60 ? 10_000 : score >= 40 ? 1_000 : 0

  return {
    agent: {
      agentId: agent.agentId,
      name:    agent.name ?? `Agent #${agent.agentId}`,
      wallet:  agent.walletAddress,
    },
    generatedAt: r.generatedAt ?? new Date().toISOString(),

    summary: {
      trustScore: score,
      riskLevel:  r.riskLevel ?? 'LOW',
      recommendation,
      maxRecommendedJobValue,
    },

    identityVerification: {
      walletAge: (() => {
        const regTs = agent.registeredAt ? Number(agent.registeredAt) * 1000 : null
        const days = regTs ? Math.floor((Date.now() - regTs) / 86_400_000) : (stats.daysActive ?? 0)
        return { status: days >= 30 ? 'PASS' : 'WARN', days, minRequired: 30 }
      })(),
      erc8004Registered: {
        status:          agent.network === 'base_mainnet' || agent.source === 'erc8004' ? 'PASS' : 'WARN',
        registryAddress: agent.network === 'base_mainnet'
          ? '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432'
          : '0x03bF6389eE5884884b1459877d3e9576492Eb1E1',
      },
      metadataValid: {
        status: agent.name ? 'PASS' : 'FAIL',
        uri:    agent.uri
          ? (agent.uri.length > 60 ? agent.uri.slice(0, 60) + '…' : agent.uri)
          : 'N/A',
      },
      agentWalletSet: {
        status: agent.walletAddress ? 'PASS' : 'FAIL',
        wallet: agent.walletAddress ?? 'NOT SET',
      },
    },

    performanceMetrics: {
      successRate:   stats.successRate   ?? 0,
      completedJobs: stats.completedJobs ?? 0,
      totalJobs:     stats.totalJobs     ?? 0,
      totalVolume:   String(stats.totalVolumeUsd ?? '0'),
      avgJobSize:    String(stats.avgJobSizeUsd   ?? '0'),
    },

    scoreBreakdown: {
      jobScore:     { value: sb.jobScore     ?? 0, max: 30 },
      successScore: { value: sb.successScore ?? 0, max: 25 },
      volumeScore:  { value: sb.volumeScore  ?? 0, max: 20 },
      ageScore:     { value: sb.ageScore     ?? 0, max: 15 },
      bonusScore:   { value: sb.bonusScore   ?? 0, max: 10 },
      penalties:    sb.penalties ?? 0,
    },

    reputationSignals: {
      repeatClients:   { bonus: sb.bonusBreakdown?.repeatClients   ?? 0, count: rep.uniqueClients ?? 0 },
      clientDiversity: { bonus: sb.bonusBreakdown?.clientDiversity ?? 0, count: stats.uniqueClients ?? 0 },
      highValueJobs:   { bonus: sb.bonusBreakdown?.highValueJobs   ?? 0, count: stats.highValueJobCount ?? 0 },
    },

    redFlagScan: Object.fromEntries(
      Object.keys(PENALTY_MAP).map(k => [k, { status: flags.includes(k) ? 'FAIL' : 'PASS' }])
    ),
  }
}
