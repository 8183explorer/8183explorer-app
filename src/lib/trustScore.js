/**
 * TrustScore Formula:
 * 
 * Base Score (90 max):
 * - Jobs: 30% → min(completedJobs / 100, 1) × 30
 * - Success: 25% → successRate × 25  
 * - Volume: 20% → min(log10(volumeUSD) / 6, 1) × 20
 * - Age: 15% → min(daysActive / 365, 1) × 15
 * 
 * Bonus (10 max):
 * - Repeat Clients: +3
 * - Client Diversity (10+): +2
 * - High Value Jobs ($10k+): +2
 * - Fast Delivery: +3
 * 
 * Penalties:
 * - SYBIL_PATTERN: -50
 * - WASH_TRADING: -30
 * - HIGH_REJECT_RATE (>20%): -20
 * - HIGH_EXPIRED_RATE (>10%): -15
 * - INACTIVE (60+ days): -10
 */
export function calculateTrustScore(jobStats, firstJobTimestamp = null) {
  const now = Date.now()
  
  // ═══════════════════════════════════════════════════════════
  // COMPONENT SCORES
  // ═══════════════════════════════════════════════════════════
  
  // Job Score (30%)
  const jobScore = Math.min(jobStats.completedJobs / 100, 1) * 30
  
  // Success Rate Score (25%)
  const successScore = jobStats.successRate * 25
  
  // Volume Score (20%) - logarithmic
  const volumeUsd = parseFloat(jobStats.totalVolumeUsd) || 0
  const volumeScore = volumeUsd > 0
    ? Math.min(Math.log10(volumeUsd) / 6, 1) * 20
    : 0
  
  // Age Score (15%)
  const daysActive = firstJobTimestamp
    ? Math.floor((now - firstJobTimestamp) / (1000 * 60 * 60 * 24))
    : 0
  const ageScore = Math.min(daysActive / 365, 1) * 15
  
  // ═══════════════════════════════════════════════════════════
  // BONUS SIGNALS (10% max)
  // ═══════════════════════════════════════════════════════════
  
  let bonusScore = 0
  const bonusDetails = []
  
  // Repeat clients
  const clientCounts = new Map()
  jobStats.jobs.forEach(j => {
    const client = j.client?.toLowerCase()
    if (client) clientCounts.set(client, (clientCounts.get(client) || 0) + 1)
  })
  const repeatClients = [...clientCounts.values()].filter(c => c >= 2).length
  if (repeatClients > 0) {
    bonusScore += 3
    bonusDetails.push({ signal: 'repeatClients', count: repeatClients, bonus: 3 })
  }
  
  // Client diversity
  if (jobStats.uniqueClients >= 10) {
    bonusScore += 2
    bonusDetails.push({ signal: 'clientDiversity', count: jobStats.uniqueClients, bonus: 2 })
  }
  
  // High value jobs
  const highValueJobs = jobStats.jobs.filter(
    j => j.status === 3 && parseFloat(j.budgetUsd || '0') > 10000
  ).length
  if (highValueJobs > 0) {
    bonusScore += 2
    bonusDetails.push({ signal: 'highValueJobs', count: highValueJobs, bonus: 2 })
  }
  
  bonusScore = Math.min(bonusScore, 10)
  
  // ═══════════════════════════════════════════════════════════
  // RED FLAGS & PENALTIES
  // ═══════════════════════════════════════════════════════════
  
  let penalties = 0
  const redFlags = []
  
  // Sybil check
  const sybilJobs = jobStats.jobs.filter(j => 
    j.provider?.toLowerCase() === j.client?.toLowerCase()
  )
  if (sybilJobs.length > 0) {
    penalties += 50
    redFlags.push({ flag: 'SYBIL_PATTERN', penalty: 50, count: sybilJobs.length })
  }
  
  // Wash trading check
  const edges = new Map()
  jobStats.jobs.forEach(j => {
    const client = j.client?.toLowerCase()
    const provider = j.provider?.toLowerCase()
    if (client && provider) {
      if (!edges.has(client)) edges.set(client, new Set())
      edges.get(client).add(provider)
    }
  })
  let washPatterns = 0
  edges.forEach((providers, client) => {
    providers.forEach(provider => {
      if (edges.has(provider) && edges.get(provider).has(client)) {
        washPatterns++
      }
    })
  })
  washPatterns = Math.floor(washPatterns / 2)
  if (washPatterns > 0) {
    penalties += 30
    redFlags.push({ flag: 'WASH_TRADING', penalty: 30, count: washPatterns })
  }
  
  // High reject rate
  const rejectRate = jobStats.totalJobs > 0 
    ? jobStats.rejectedJobs / jobStats.totalJobs 
    : 0
  if (rejectRate > 0.2) {
    penalties += 20
    redFlags.push({ flag: 'HIGH_REJECT_RATE', penalty: 20, rate: rejectRate })
  }
  
  // High expired rate
  const expiredRate = jobStats.totalJobs > 0
    ? jobStats.expiredJobs / jobStats.totalJobs
    : 0
  if (expiredRate > 0.1) {
    penalties += 15
    redFlags.push({ flag: 'HIGH_EXPIRED_RATE', penalty: 15, rate: expiredRate })
  }
  
  // ═══════════════════════════════════════════════════════════
  // FINAL SCORE
  // ═══════════════════════════════════════════════════════════
  
  const rawScore = jobScore + successScore + volumeScore + ageScore + bonusScore - penalties
  const totalScore = Math.max(0, Math.min(100, Math.round(rawScore)))
  
  // ═══════════════════════════════════════════════════════════
  // BADGES
  // ═══════════════════════════════════════════════════════════
  
  const badges = []
  
  if (jobStats.completedJobs >= 10 && jobStats.successRate >= 0.8) {
    badges.push('VERIFIED')
  }
  
  if (totalScore >= 85 && jobStats.completedJobs >= 50) {
    badges.push('TOP_RATED')
  }
  
  if (daysActive > 0 && daysActive < 30) {
    badges.push('NEW')
  }
  
  if (redFlags.length > 0) {
    badges.push('WARNING')
  }
  
  return {
    jobScore: Math.round(jobScore * 10) / 10,
    successScore: Math.round(successScore * 10) / 10,
    volumeScore: Math.round(volumeScore * 10) / 10,
    ageScore: Math.round(ageScore * 10) / 10,
    bonusScore,
    bonusDetails,
    penalties,
    redFlags,
    totalScore,
    badges,
    daysActive,
  }
}
