import { formatEther } from 'viem'
import { getEthPriceUsd } from './price.ts'

export interface JobRow {
  job_id:           bigint | number
  client_address:   string
  provider_address: string
  status:           number
  budget_wei:       string
  created_at:       bigint | number | null
  completed_at:     bigint | number | null
  expired_at:       bigint | number | null
}

export interface TrustScoreResult {
  totalScore:    number
  jobScore:      number
  successScore:  number
  volumeScore:   number
  ageScore:      number
  bonusScore:    number
  bonusBreakdown: {
    repeatClients:   number
    clientDiversity: number
    highValueJobs:   number
    fastDelivery:    number
  }
  penalties:     number
  badges:        string[]
  redFlags:      string[]
  stats: {
    totalJobs:          number
    completedJobs:      number
    rejectedJobs:       number
    expiredJobs:        number
    successRate:        number
    uniqueClients:      number
    totalVolumeUsd:     number
    avgJobSizeUsd:      number
    highValueJobCount:  number
    daysActive:         number
  }
}

/** For virtuals_acp agents — build a TrustScoreResult from pre-aggregated external_stats */
export function calculateTrustScoreFromExternal(
  externalStats: Record<string, unknown>,
  registeredAt: number | null,
  source: string,
): TrustScoreResult {
  const completedJobs  = Number(externalStats.successfulJobCount ?? 0)
  const successRate01  = Number(externalStats.successRate        ?? 0) / 100
  const uniqueClients  = Number(externalStats.uniqueBuyerCount   ?? 0)
  const grossUsd       = Number(externalStats.grossAgenticAmount ?? 0)

  const daysActive = registeredAt
    ? Math.floor((Date.now() - registeredAt * 1000) / 86_400_000)
    : 0

  const jobScore     = Math.min(completedJobs / 100, 1) * 30
  const successScore = successRate01 * 25
  const volumeScore  = grossUsd > 0 ? Math.min(Math.log10(grossUsd) / 6, 1) * 20 : 0
  const ageScore     = Math.min(daysActive / 365, 1) * 15

  let bonusScore = 0
  const bonusBreakdown = { repeatClients: 0, clientDiversity: 0, highValueJobs: 0, fastDelivery: 0 }
  if (uniqueClients >= 10) { bonusBreakdown.clientDiversity = 2; bonusScore += 2 }
  if (grossUsd >= 10_000)  { bonusBreakdown.highValueJobs   = 2; bonusScore += 2 }
  bonusScore = Math.min(bonusScore, 10)

  const totalScore = Math.max(0, Math.min(100,
    jobScore + successScore + volumeScore + ageScore + bonusScore
  ))

  const badges: string[] = []
  if (source === 'virtuals_acp')                                badges.push('ACP')
  if (completedJobs >= 10 && successRate01 >= 0.80)             badges.push('VERIFIED')
  if (totalScore >= 85 && completedJobs >= 50)                  badges.push('TOP_RATED')
  if (externalStats.isOnline)                                   badges.push('HOT')

  return {
    totalScore:   Math.round(totalScore * 10) / 10,
    jobScore:     Math.round(jobScore * 10) / 10,
    successScore: Math.round(successScore * 10) / 10,
    volumeScore:  Math.round(volumeScore * 10) / 10,
    ageScore:     Math.round(ageScore * 10) / 10,
    bonusScore,
    bonusBreakdown,
    penalties: 0,
    badges,
    redFlags: [],
    stats: {
      totalJobs:         completedJobs,
      completedJobs,
      rejectedJobs:      0,
      expiredJobs:       0,
      successRate:       Math.round(successRate01 * 1000) / 10,
      uniqueClients,
      totalVolumeUsd:    Math.round(grossUsd * 100) / 100,
      avgJobSizeUsd:     completedJobs > 0 ? Math.round(grossUsd / completedJobs * 100) / 100 : 0,
      highValueJobCount: grossUsd >= 10_000 ? 1 : 0,
      daysActive,
    },
  }
}

export function calculateTrustScore(
  jobs: JobRow[],
  registeredAt: number | null,
  source?: string
): TrustScoreResult {
  const now = Date.now()
  const ethPrice = getEthPriceUsd()

  // ── Job counts ────────────────────────────────────────────────────────────
  const completed = jobs.filter(j => j.status === 3)
  const rejected  = jobs.filter(j => j.status === 4)
  const expired   = jobs.filter(j => j.status === 5)
  const terminal  = completed.length + rejected.length + expired.length

  const successRate    = terminal > 0 ? completed.length / terminal : 0
  const uniqueClients  = new Set(jobs.map(j => j.client_address.toLowerCase())).size

  // Volume in USD via live ETH price
  const totalVolumeEth = completed.reduce((sum, j) => {
    try { return sum + parseFloat(formatEther(BigInt(j.budget_wei))) } catch { return sum }
  }, 0)
  const totalVolumeUsd = totalVolumeEth * ethPrice

  // Age in days (from contract registration or first job)
  const firstJobTs = jobs.length > 0
    ? Math.min(...jobs.map(j => Number(j.created_at ?? Infinity)).filter(n => n !== Infinity))
    : null
  const originTs = registeredAt ? registeredAt * 1000 : (firstJobTs ? firstJobTs * 1000 : null)
  const daysActive = originTs ? Math.floor((now - originTs) / 86_400_000) : 0

  // ── Base scores ──────────────────────────────────────────────────────────
  const jobScore     = Math.min(completed.length / 100, 1) * 30
  const successScore = successRate * 25
  const volumeScore  = totalVolumeUsd > 0 ? Math.min(Math.log10(totalVolumeUsd) / 6, 1) * 20 : 0
  const ageScore     = Math.min(daysActive / 365, 1) * 15

  // ── Bonuses ──────────────────────────────────────────────────────────────
  let bonusScore = 0
  const bonusBreakdown = { repeatClients: 0, clientDiversity: 0, highValueJobs: 0, fastDelivery: 0 }

  // Repeat clients
  const clientCounts = new Map<string, number>()
  jobs.forEach(j => {
    const c = j.client_address.toLowerCase()
    clientCounts.set(c, (clientCounts.get(c) ?? 0) + 1)
  })
  const hasRepeatClients = [...clientCounts.values()].some(c => c > 1)
  if (hasRepeatClients) { bonusBreakdown.repeatClients = 3; bonusScore += 3 }

  // Client diversity
  if (uniqueClients >= 10) { bonusBreakdown.clientDiversity = 2; bonusScore += 2 }

  // High value jobs ($10k+)
  const highValueJobs = completed.filter(j => {
    try { return parseFloat(formatEther(BigInt(j.budget_wei))) * ethPrice >= 10_000 } catch { return false }
  })
  if (highValueJobs.length > 0) { bonusBreakdown.highValueJobs = 2; bonusScore += 2 }

  // Fast delivery — completed before 50% of expiry window
  const fastDeliveries = completed.filter(j => {
    if (!j.created_at || !j.completed_at || !j.expired_at) return false
    const created     = Number(j.created_at)
    const completedTs = Number(j.completed_at)
    const expiry      = Number(j.expired_at)
    const window      = expiry - created
    return window > 0 && (completedTs - created) < window * 0.5
  })
  if (fastDeliveries.length > 0) { bonusBreakdown.fastDelivery = 3; bonusScore += 3 }

  bonusScore = Math.min(bonusScore, 10)

  // ── Penalties & red flags ─────────────────────────────────────────────────
  let penalties = 0
  const redFlags: string[] = []

  // Sybil: provider === client on same job
  const sybilJobs = jobs.filter(j => j.client_address.toLowerCase() === j.provider_address.toLowerCase())
  if (sybilJobs.length > 0) { penalties += 50; redFlags.push('SYBIL_PATTERN') }

  // Wash trading: A hires B AND B hires A
  const providerSet = new Set(jobs.map(j => j.provider_address.toLowerCase()))
  const clientSet   = new Set(jobs.map(j => j.client_address.toLowerCase()))
  const washOverlap = [...providerSet].filter(p => clientSet.has(p))
  if (washOverlap.length > 0 && washOverlap[0] !== jobs[0]?.provider_address.toLowerCase()) {
    penalties += 30; redFlags.push('WASH_TRADING')
  }

  // High reject rate
  if (terminal > 4 && rejected.length / terminal > 0.20) {
    penalties += 20; redFlags.push('HIGH_REJECT_RATE')
  }

  // High expired rate
  if (terminal > 4 && expired.length / terminal > 0.10) {
    penalties += 15; redFlags.push('HIGH_EXPIRED_RATE')
  }

  // Inactive
  const lastActivity = jobs.reduce((max, j) => {
    const t = Number(j.completed_at ?? j.created_at ?? 0)
    return t > max ? t : max
  }, 0)
  if (lastActivity > 0 && (now / 1000 - lastActivity) > 60 * 86_400) {
    penalties += 10; redFlags.push('INACTIVE')
  }

  // ── Total ─────────────────────────────────────────────────────────────────
  const totalScore = Math.max(0, Math.min(100,
    jobScore + successScore + volumeScore + ageScore + bonusScore - penalties
  ))

  // ── Badges ────────────────────────────────────────────────────────────────
  const badges: string[] = []
  const ageDays = daysActive

  if (source === 'erc8004')                                  badges.push('MAINNET')
  if (redFlags.length > 0)                                   badges.push('WARNING')
  if (ageDays < 30 && jobs.length > 0)                       badges.push('NEW')
  if (completed.length >= 10 && successRate >= 0.80)         badges.push('VERIFIED')
  if (totalScore >= 85 && completed.length >= 50)            badges.push('TOP_RATED')

  // HOT: 5+ jobs in last 7 days
  const sevenDaysAgo = now / 1000 - 7 * 86_400
  const recentJobs = jobs.filter(j => Number(j.created_at ?? 0) >= sevenDaysAgo)
  if (recentJobs.length >= 5)                                badges.push('HOT')

  const avgJobSizeUsd = completed.length > 0
    ? Math.round(totalVolumeUsd / completed.length * 100) / 100
    : 0

  return {
    totalScore:   Math.round(totalScore * 10) / 10,
    jobScore:     Math.round(jobScore * 10) / 10,
    successScore: Math.round(successScore * 10) / 10,
    volumeScore:  Math.round(volumeScore * 10) / 10,
    ageScore:     Math.round(ageScore * 10) / 10,
    bonusScore,
    bonusBreakdown,
    penalties,
    badges,
    redFlags,
    stats: {
      totalJobs:         terminal,
      completedJobs:     completed.length,
      rejectedJobs:      rejected.length,
      expiredJobs:       expired.length,
      successRate:       Math.round(successRate * 1000) / 10,
      uniqueClients,
      totalVolumeUsd:    Math.round(totalVolumeUsd * 100) / 100,
      avgJobSizeUsd,
      highValueJobCount: highValueJobs.length,
      daysActive,
    },
  }
}
