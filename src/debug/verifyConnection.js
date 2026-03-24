/**
 * 8183Explorer — On-Chain Connection Verifier
 *
 * HOW TO USE:
 *   1. Open the app in your browser (npm run dev)
 *   2. Open DevTools → Console
 *   3. Copy-paste this entire file into the console and press Enter
 *   4. Or import and call: window.__trustRadarVerify()
 *
 * This script tests every contract read used by the frontend
 * and logs a pass/fail for each one.
 */

import {
  createPublicClient,
  http,
  fallback,
  parseAbi,
  parseAbiItem,
  formatEther,
} from 'viem'
import { baseSepolia } from 'viem/chains'

// ─── CONFIG ────────────────────────────────────────────────────────────────

const ADDRESSES = {
  identityRegistry:   '0x03bF6389eE5884884b1459877d3e9576492Eb1E1',
  reputationRegistry: '0x552C798370A1B1C9e0988B9B30103e2da058e7Ba',
  agenticCommerce:    '0x5D8e20e2247d38e0A64B78Bc7B6f2Fe06CEBE0B7',
}

const IDENTITY_ABI = parseAbi([
  'function totalSupply() view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function getAgentWallet(uint256 agentId) view returns (address)',
])

const REPUTATION_ABI = parseAbi([
  'function getClients(uint256 agentId) view returns (address[])',
  'function getSummary(uint256 agentId, address[] clientAddresses, string tag1, string tag2) view returns (uint64 count, int128 summaryValue, uint8 summaryValueDecimals)',
])

const COMMERCE_ABI = parseAbi([
  'function jobCounter() view returns (uint256)',
  'function getJob(uint256 jobId) view returns ((uint256 id, address client, address provider, address evaluator, string description, uint256 budget, uint256 expiredAt, uint8 status, address hook))',
])

const COMMERCE_EVENT = parseAbiItem(
  'event JobCreated(uint256 indexed jobId, address indexed client, address indexed provider, address evaluator, uint256 expiredAt, address hook)'
)

const JOB_STATUS = ['Open','Funded','Submitted','Completed','Rejected','Expired']

// ─── CLIENT ────────────────────────────────────────────────────────────────

const client = createPublicClient({
  chain: baseSepolia,
  transport: fallback([
    http('https://sepolia.base.org'),
    http('https://base-sepolia-rpc.publicnode.com'),
  ]),
  batch: { multicall: true },
})

// ─── HELPERS ───────────────────────────────────────────────────────────────

const pass = (label, value) => {
  console.log(`%c ✅ PASS %c ${label}`, 'color:white;background:#16a34a;padding:2px 6px;border-radius:3px', 'color:#16a34a;font-weight:bold', value)
  return value
}

const fail = (label, error) => {
  console.error(`%c ❌ FAIL %c ${label}`, 'color:white;background:#dc2626;padding:2px 6px;border-radius:3px', 'color:#dc2626;font-weight:bold', error?.message || error)
  return null
}

const info = (label, value) => {
  console.info(`%c ℹ️  INFO %c ${label}`, 'color:white;background:#2563eb;padding:2px 6px;border-radius:3px', 'color:#2563eb;font-weight:bold', value)
}

// ─── TEST SUITE ────────────────────────────────────────────────────────────

export async function verifyConnection() {
  console.group('%c 8183Explorer — Contract Connection Verification', 'font-size:16px;font-weight:bold;color:#a855f7')
  console.log('Network: Base Sepolia (Chain ID 84532)')
  console.log('Contracts:', ADDRESSES)
  console.log('───────────────────────────────────────────')

  const results = {
    passed: 0,
    failed: 0,
    details: {},
  }

  // ── 1. CHAIN CHECK ────────────────────────────────────────────────────────
  console.group('1️⃣  Chain & RPC')
  try {
    const chainId = await client.getChainId()
    const block   = await client.getBlockNumber()
    if (chainId === 84532) {
      pass('Chain ID matches Base Sepolia (84532)', chainId)
      pass('Latest block number', block)
      results.passed += 2
      results.details.chain = { chainId: Number(chainId), latestBlock: Number(block) }
    } else {
      fail('Unexpected chain ID', new Error(`Got ${chainId}, expected 84532`))
      results.failed++
    }
  } catch (e) {
    fail('RPC connection', e)
    results.failed++
  }
  console.groupEnd()

  // ── 2. AGENT REGISTRY ─────────────────────────────────────────────────────
  console.group('2️⃣  AgentRegistry (ERC-8004 Identity)')
  let agentIds = []
  try {
    const totalSupply = await client.readContract({
      address: ADDRESSES.identityRegistry,
      abi: IDENTITY_ABI,
      functionName: 'totalSupply',
    })

    const total = Number(totalSupply)
    if (total > 0) {
      pass(`totalSupply() → ${total} agents registered`, total)
      results.passed++
      results.details.agentRegistry = { totalSupply: total }
    } else {
      fail('totalSupply() returned 0 — seed data may not have run', new Error('Expected 5 agents'))
      results.failed++
    }

    // Fetch tokenURI + owner + wallet for all agents via multicall
    agentIds = Array.from({ length: total }, (_, i) => BigInt(i + 1))
    const calls = agentIds.flatMap(id => [
      { address: ADDRESSES.identityRegistry, abi: IDENTITY_ABI, functionName: 'tokenURI', args: [id] },
      { address: ADDRESSES.identityRegistry, abi: IDENTITY_ABI, functionName: 'ownerOf',  args: [id] },
      { address: ADDRESSES.identityRegistry, abi: IDENTITY_ABI, functionName: 'getAgentWallet', args: [id] },
    ])

    const mcResults = await client.multicall({ contracts: calls })

    let mcPass = 0, mcFail = 0
    for (let i = 0; i < agentIds.length; i++) {
      const base = i * 3
      const uriR    = mcResults[base]
      const ownerR  = mcResults[base + 1]
      const walletR = mcResults[base + 2]

      if (uriR.status === 'success') {
        mcPass++
        info(`Agent ${agentIds[i]}: URI = ${uriR.result?.substring(0, 60)}...`, {
          owner:  ownerR.result,
          wallet: walletR.result,
        })
      } else {
        mcFail++
        fail(`Agent ${agentIds[i]} tokenURI()`, uriR.error)
      }
    }

    if (mcFail === 0) {
      pass(`multicall: all ${mcPass} agents returned valid data`, { mcPass, mcFail })
      results.passed++
    } else {
      fail(`multicall: ${mcFail} agents failed`, new Error(`${mcFail} failures`))
      results.failed++
    }

    results.details.agentRegistry.multicallPass = mcPass
    results.details.agentRegistry.multicallFail = mcFail

  } catch (e) {
    fail('AgentRegistry calls', e)
    results.failed++
  }
  console.groupEnd()

  // ── 3. REPUTATION REGISTRY ────────────────────────────────────────────────
  console.group('3️⃣  ReputationRegistry (ERC-8004 Reputation)')
  try {
    const testAgentId = 1n
    const clients = await client.readContract({
      address: ADDRESSES.reputationRegistry,
      abi: REPUTATION_ABI,
      functionName: 'getClients',
      args: [testAgentId],
    })

    pass(`getClients(agentId=1) → ${clients.length} feedback giver(s)`, clients)
    results.passed++
    results.details.reputationRegistry = { clientsForAgent1: clients.length }

    if (clients.length > 0) {
      const summary = await client.readContract({
        address: ADDRESSES.reputationRegistry,
        abi: REPUTATION_ABI,
        functionName: 'getSummary',
        args: [testAgentId, clients, '', ''],
      })

      const count    = summary.count    ?? summary[0]
      const sumVal   = summary.summaryValue ?? summary[1]
      const decimals = summary.summaryValueDecimals ?? summary[2]
      const avg      = Number(count) > 0
        ? (Number(sumVal) / Number(count) / Math.pow(10, Number(decimals))).toFixed(2)
        : '0.00'

      pass(`getSummary(agentId=1) → count=${count}, avg=${avg}`, { count: Number(count), summaryValue: Number(sumVal), decimals: Number(decimals), avg })
      results.passed++
      results.details.reputationRegistry.summary = { count: Number(count), avg }
    } else {
      info('No feedback clients yet for agent 1 — getSummary skipped', 'OK (clients array empty)')
    }

  } catch (e) {
    fail('ReputationRegistry calls', e)
    results.failed++
  }
  console.groupEnd()

  // ── 4. AGENTIC COMMERCE ───────────────────────────────────────────────────
  console.group('4️⃣  AgenticCommerce (ERC-8183)')
  try {
    const jobCount = await client.readContract({
      address: ADDRESSES.agenticCommerce,
      abi: COMMERCE_ABI,
      functionName: 'jobCounter',
    })

    const total = Number(jobCount)
    pass(`jobCounter() → ${total} jobs created`, total)
    results.passed++
    results.details.agenticCommerce = { jobCounter: total }

    if (total > 0) {
      // Fetch job #1 to verify struct decoding
      const job = await client.readContract({
        address: ADDRESSES.agenticCommerce,
        abi: COMMERCE_ABI,
        functionName: 'getJob',
        args: [1n],
      })

      const statusIdx = Number(job.status ?? job[7])
      pass('getJob(1) struct decoding', {
        id:         Number(job.id        ?? job[0]),
        client:     job.client     ?? job[1],
        provider:   job.provider   ?? job[2],
        description:(job.description ?? job[4])?.substring(0, 40),
        budget:     formatEther(job.budget ?? job[5]) + ' ETH',
        status:     `${statusIdx} (${JOB_STATUS[statusIdx] || 'Unknown'})`,
      })
      results.passed++
    } else {
      info('jobCounter is 0 — getJob skipped', 'No jobs seeded yet')
    }

    // ── Event scan
    const currentBlock = await client.getBlockNumber()
    const fromBlock    = currentBlock > 1_296_000n ? currentBlock - 1_296_000n : 0n

    const logs = await client.getLogs({
      address: ADDRESSES.agenticCommerce,
      event:   COMMERCE_EVENT,
      fromBlock,
      toBlock: 'latest',
    })

    if (logs.length > 0) {
      pass(`getLogs(JobCreated) → ${logs.length} event(s) found`, logs.map(l => ({
        jobId:    Number(l.args.jobId),
        client:   l.args.client,
        provider: l.args.provider,
        block:    Number(l.blockNumber),
      })))
      results.passed++
      results.details.agenticCommerce.jobCreatedEvents = logs.length
    } else {
      fail('getLogs(JobCreated) — 0 events found in scan range', new Error('Expected ≥9 events from seed data'))
      results.failed++
    }

  } catch (e) {
    fail('AgenticCommerce calls', e)
    results.failed++
  }
  console.groupEnd()

  // ── SUMMARY ───────────────────────────────────────────────────────────────
  console.log('───────────────────────────────────────────')
  const total = results.passed + results.failed
  if (results.failed === 0) {
    console.log(`%c ✅ ALL ${total} CHECKS PASSED — Frontend ↔ Chain integration is healthy`, 'color:white;background:#16a34a;font-size:14px;font-weight:bold;padding:4px 10px;border-radius:4px')
  } else {
    console.warn(`%c ⚠️  ${results.failed}/${total} CHECKS FAILED — See details above`, 'color:white;background:#d97706;font-size:14px;font-weight:bold;padding:4px 10px;border-radius:4px')
  }
  console.log('Full results:', results)
  console.groupEnd()

  return results
}

// Auto-expose on window for in-browser console use
if (typeof window !== 'undefined') {
  window.__trustRadarVerify = verifyConnection
  console.log('%c 8183Explorer verifyConnection loaded — run window.__trustRadarVerify() to test', 'color:#a855f7;font-weight:bold')
}
