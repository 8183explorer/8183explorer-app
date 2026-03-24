/**
 * Audit Report Generator
 * Combines ERC-8004 identity, reputation, and ERC-8183 job data
 * into a comprehensive risk assessment report.
 */

import { fetchAgentById } from './fetchAgents.js'
import { fetchAgentReputation } from './fetchReputation.js'
import { linkAgentToJobs } from './fetchJobs.js'
import { calculateTrustScore } from './trustScore.js'
import { ENV, getActiveAddresses } from '../config/contracts.js'

/**
 * Generate a full audit report for an agent.
 * @param {bigint|number|string} agentId - The agent's NFT ID
 * @returns {Promise<object>} Complete audit report
 */
export async function generateAuditReport(agentId) {
  // Fetch all data in parallel where possible
  const agent = await fetchAgentById(agentId)
  if (!agent) throw new Error(`Agent ${agentId} not found`)

  const [reputation, jobStats] = await Promise.all([
    fetchAgentReputation(agentId),
    linkAgentToJobs(agentId, agent.wallet),
  ])

  // Estimate first job timestamp (approximate; precise would need block → timestamp)
  const firstJobTimestamp =
    jobStats.totalJobs > 0
      ? Date.now() - 90 * 24 * 60 * 60 * 1000 // ~90 day estimate for demo
      : null

  const trustScore = calculateTrustScore(jobStats, firstJobTimestamp)

  // ─── Risk Assessment ──────────────────────────────────────
  let riskLevel
  if (trustScore.totalScore >= 80 && trustScore.redFlags.length === 0) {
    riskLevel = 'LOW'
  } else if (trustScore.totalScore >= 60 && trustScore.redFlags.length <= 1) {
    riskLevel = 'MEDIUM'
  } else if (trustScore.totalScore >= 40) {
    riskLevel = 'HIGH'
  } else {
    riskLevel = 'CRITICAL'
  }

  const maxRecommendedJobValue = { LOW: 50000, MEDIUM: 10000, HIGH: 1000, CRITICAL: 0 }[riskLevel]
  const recommendation = buildRecommendation(trustScore, riskLevel, jobStats)

  // ─── Build Report ─────────────────────────────────────────
  const addresses = getActiveAddresses()
  const useMockData = ENV.useERC8004Mock || ENV.useERC8183Mock

  return {
    // Header
    reportId: `AR-${Date.now()}-${agentId}`,
    generatedAt: new Date().toISOString(),
    agentId: BigInt(agentId).toString(),
    agentName: agent.name,
    agentWallet: agent.wallet,

    // Executive Summary
    summary: {
      trustScore: trustScore.totalScore,
      riskLevel,
      recommendation,
      maxRecommendedJobValue,
    },

    // Section 1: Identity Verification
    identityVerification: {
      walletAge: {
        status: trustScore.daysActive >= 30 ? 'PASS' : 'WARN',
        days: trustScore.daysActive,
        minRequired: 30,
      },
      erc8004Registered: {
        status: 'PASS',
        registryAddress: addresses.identityRegistry || 'MOCK (contracts TBD)',
      },
      metadataValid: {
        status: agent.metadata ? 'PASS' : 'FAIL',
        uri: agent.uri,
        errors: agent.metadata ? [] : ['Could not fetch metadata from URI'],
      },
      agentWalletSet: {
        status:
          agent.wallet && agent.wallet !== '0x0000000000000000000000000000000000000000'
            ? 'PASS'
            : 'FAIL',
        wallet: agent.wallet,
      },
    },

    // Section 2: Performance Metrics
    performanceMetrics: {
      totalJobs: jobStats.totalJobs,
      completedJobs: jobStats.completedJobs,
      rejectedJobs: jobStats.rejectedJobs,
      expiredJobs: jobStats.expiredJobs,
      successRate: Math.round(jobStats.successRate * 10000) / 100, // as percentage
      totalVolume: jobStats.totalVolumeUsd,
      avgJobSize: jobStats.avgJobSizeUsd,
      avgResponseTime: null, // Requires block timestamps
    },

    // Section 3: Reputation Signals
    reputationSignals: {
      feedbackScore: { average: reputation.averageScore, count: reputation.count },
      repeatClients:
        trustScore.bonusDetails.find((b) => b.signal === 'repeatClients') || { count: 0, bonus: 0 },
      clientDiversity: {
        count: jobStats.uniqueClients,
        bonus: jobStats.uniqueClients >= 10 ? 2 : 0,
      },
      highValueJobs:
        trustScore.bonusDetails.find((b) => b.signal === 'highValueJobs') || { count: 0, bonus: 0 },
    },

    // Section 4: Red Flag Scan
    redFlagScan: buildRedFlagScan(trustScore.redFlags),

    // Section 5: Score Breakdown
    scoreBreakdown: {
      jobScore: { weight: 30, value: trustScore.jobScore, max: 30 },
      successScore: { weight: 25, value: trustScore.successScore, max: 25 },
      volumeScore: { weight: 20, value: trustScore.volumeScore, max: 20 },
      ageScore: { weight: 15, value: trustScore.ageScore, max: 15 },
      bonusScore: { weight: 10, value: trustScore.bonusScore, max: 10 },
      penalties: trustScore.penalties,
      finalScore: trustScore.totalScore,
    },

    // Section 6: Badges
    badges: trustScore.badges,

    // Section 7: Job History (last 20)
    jobHistory: jobStats.jobs.slice(0, 20).map((j) => ({
      jobId: j.jobId?.toString(),
      date: j.expiredAt instanceof Date ? j.expiredAt.toISOString() : 'Unknown',
      client: truncate(j.client),
      description: (j.description || 'N/A').substring(0, 60),
      amount: j.budgetUsd || '0.00',
      status: j.statusName,
      evaluator: truncate(j.evaluator),
    })),

    // Section 8: On-Chain Verification Links
    onChainVerification: {
      identityRegistry: addresses.identityRegistry || 'TBD',
      reputationRegistry: addresses.reputationRegistry || 'TBD',
      commerceContract: addresses.agenticCommerce || 'TBD',
      chainId: ENV.erc8183Chain.id,
      blockExplorerUrl: ENV.isProduction
        ? `https://basescan.org/address/${agent.wallet}`
        : `https://sepolia.basescan.org/address/${agent.wallet}`,
      demoMode: useMockData,
    },
  }
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function buildRecommendation(trustScore, riskLevel, jobStats) {
  const score = trustScore.totalScore
  const flags = trustScore.redFlags.map((f) => f.flag).join(', ')
  const successPct = Math.round(jobStats.successRate * 100)

  if (riskLevel === 'LOW') {
    return `This agent has passed all verification checks with a TrustScore of ${score}/100. Recommended for jobs up to $50,000. ${jobStats.completedJobs} jobs completed with ${successPct}% success rate.`
  } else if (riskLevel === 'MEDIUM') {
    return `This agent has a moderate trust level (score ${score}/100). Recommended for jobs up to $10,000. Consider additional verification for larger engagements.`
  } else if (riskLevel === 'HIGH') {
    return `This agent has elevated risk factors. Score: ${score}/100. Red flags detected: ${flags}. Use caution and limit job value to $1,000.`
  } else {
    return `⚠️ WARNING: This agent has critical risk factors. Score: ${score}/100. Red flags: ${flags}. Not recommended for any jobs until issues are resolved.`
  }
}

function buildRedFlagScan(detectedFlags) {
  // Start with all-PASS defaults
  const scan = {
    sybil_pattern: { status: 'PASS', detected: 0, threshold: 0 },
    wash_trading: { status: 'PASS', detected: 0, threshold: 0 },
    high_reject_rate: { status: 'PASS', rate: 0, threshold: 0.2 },
    high_expired_rate: { status: 'PASS', rate: 0, threshold: 0.1 },
    inactive: { status: 'PASS', daysSinceLastJob: 0 },
  }

  detectedFlags.forEach((flag) => {
    const key = flag.flag.toLowerCase()
    scan[key] = { status: 'FAIL', ...flag.details }
  })

  return scan
}

function truncate(address) {
  if (!address) return 'N/A'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
