import { parseAbi, parseAbiItem, formatEther } from 'viem'
import { baseClient, getActiveAddresses, ENV, COMMERCE_ABI, JOB_STATUS } from '../config/contracts'
import { getMockJobs } from './mockData'

// Scan last ~30 days of blocks (Base Sepolia: ~2s avg block time)
// 30 days × 24h × 60m × 30 blocks/min = 1,296,000 blocks
const BLOCKS_TO_SCAN = 30n * 24n * 60n * 30n

/**
 * Fetch all jobs for a provider address from ERC-8183 AgenticCommerce.
 * Jobs use native ETH as budget (msg.value), so we format with formatEther.
 */
export async function fetchAgentJobs(providerAddress) {
  if (ENV.useERC8183Mock) {
    return getMockJobs(providerAddress)
  }

  const addresses = getActiveAddresses()

  if (!addresses.agenticCommerce) {
    console.log('[8183Explorer] ERC-8183 not deployed, using mock jobs')
    return getMockJobs(providerAddress)
  }

  try {
    const currentBlock = await baseClient.getBlockNumber()
    const fromBlock = currentBlock > BLOCKS_TO_SCAN
      ? currentBlock - BLOCKS_TO_SCAN
      : 0n

    console.log(`[8183Explorer] Scanning JobCreated events from block ${fromBlock} to latest for provider ${providerAddress}`)

    // Get JobCreated events where this address is the provider
    const createdLogs = await baseClient.getLogs({
      address: addresses.agenticCommerce,
      event: parseAbiItem(
        'event JobCreated(uint256 indexed jobId, address indexed client, address indexed provider, address evaluator, uint256 expiredAt, address hook)'
      ),
      args: { provider: providerAddress },
      fromBlock,
      toBlock: 'latest',
    })

    if (createdLogs.length === 0) {
      console.log(`[8183Explorer] No jobs found for provider ${providerAddress}`)
      return []
    }

    console.log(`[8183Explorer] Found ${createdLogs.length} JobCreated events for provider ${providerAddress}`)

    const abi = parseAbi(COMMERCE_ABI)
    const jobIds = createdLogs.map(log => log.args.jobId)

    // Batch-fetch job details via multicall
    const jobCalls = jobIds.map(jobId => ({
      address: addresses.agenticCommerce,
      abi,
      functionName: 'getJob',
      args: [jobId],
    }))

    const jobResults = await baseClient.multicall({ contracts: jobCalls })

    // getJob returns a Job struct → viem gives us a named-field object
    const jobs = jobResults.map((result, i) => {
      if (result.status === 'failure') {
        console.warn(`[8183Explorer] getJob failed for jobId ${jobIds[i]}:`, result.error)
        return null
      }

      const job = result.result  // { id, client, provider, evaluator, description, budget, expiredAt, status, hook }

      return {
        jobId:        job.id,
        client:       job.client,
        provider:     job.provider,
        evaluator:    job.evaluator,
        description:  job.description,
        // budget is native ETH (wei) — format to ETH string
        budget:       job.budget,
        budgetEth:    formatEther(job.budget),
        // Keep a USD-compatible field as '0.00' since there's no stablecoin here
        budgetUsd:    '0.00',
        expiredAt:    new Date(Number(job.expiredAt) * 1000),
        status:       Number(job.status),
        statusName:   JOB_STATUS[Number(job.status)] || 'Unknown',
        hook:         job.hook,
        createdBlock: createdLogs[i].blockNumber,
      }
    }).filter(Boolean)

    return jobs

  } catch (error) {
    console.error('[8183Explorer] Failed to fetch jobs:', error)
    return getMockJobs(providerAddress)
  }
}

/**
 * Calculate job statistics from raw job list.
 */
export async function calculateJobStats(providerAddress) {
  const jobs = await fetchAgentJobs(providerAddress)

  const completed = jobs.filter(j => j.status === 3)
  const rejected  = jobs.filter(j => j.status === 4)
  const expired   = jobs.filter(j => j.status === 5)
  const terminal  = completed.length + rejected.length + expired.length

  // Volume in ETH (not USD) since contracts use native ETH
  const totalVolumeEth = completed.reduce(
    (sum, j) => sum + parseFloat(j.budgetEth || '0'),
    0
  )

  const uniqueClients = new Set(jobs.map(j => j.client?.toLowerCase())).size

  return {
    totalJobs:      terminal,
    completedJobs:  completed.length,
    rejectedJobs:   rejected.length,
    expiredJobs:    expired.length,
    pendingJobs:    jobs.length - terminal,
    successRate:    terminal > 0 ? completed.length / terminal : 0,
    // Keep budgetUsd for TrustScore compat (volume score will be 0 without USD data)
    totalVolumeUsd: '0.00',
    totalVolumeEth: totalVolumeEth.toFixed(6),
    avgJobSizeEth:  terminal > 0 ? (totalVolumeEth / terminal).toFixed(6) : '0.000000',
    avgJobSizeUsd:  '0.00',
    uniqueClients,
    jobs,
  }
}

/**
 * Link agent to jobs via its operational wallet address.
 * Returns zero stats if the wallet is the zero address.
 */
export async function linkAgentToJobs(agentId, agentWallet) {
  if (!agentWallet || agentWallet === '0x0000000000000000000000000000000000000000') {
    return {
      totalJobs:      0,
      completedJobs:  0,
      rejectedJobs:   0,
      expiredJobs:    0,
      pendingJobs:    0,
      successRate:    0,
      totalVolumeUsd: '0.00',
      totalVolumeEth: '0.000000',
      avgJobSizeUsd:  '0.00',
      avgJobSizeEth:  '0.000000',
      uniqueClients:  0,
      jobs:           [],
    }
  }

  return calculateJobStats(agentWallet)
}
