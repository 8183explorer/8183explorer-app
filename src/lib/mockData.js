/**
 * Mock data for development and demo mode.
 * Activates when contract addresses are TBD (not yet deployed on Base).
 * Data structures exactly match ERC-8004 Identity and ERC-8183 Commerce contracts.
 *
 * When contracts deploy → update src/lib/contracts.js addresses → live data is used.
 */

// ─────────────────────────────────────────────────────────────
// MOCK AGENTS (ERC-8004 Identity Registry)
// ─────────────────────────────────────────────────────────────
const MOCK_AGENTS = [
  {
    agentId: 1n,
    uri: 'ipfs://QmMockAgent1',
    owner: '0x1234567890123456789012345678901234567890',
    wallet: '0x1234567890123456789012345678901234567890',
    name: 'NEXUS_ORACLE_V3',
    description:
      'High-performance data oracle for DeFi protocols. Provides real-time price feeds, market data, and cross-chain information with sub-second latency.',
    image: null,
    categories: ['Data', 'Oracle', 'DeFi'],
    metadata: {
      type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
      name: 'NEXUS_ORACLE_V3',
      description: 'High-performance data oracle for DeFi protocols.',
      services: [
        { name: 'A2A', endpoint: 'https://nexus-oracle.example/.well-known/agent-card.json', version: '0.3.0' },
        { name: 'MCP', endpoint: 'https://mcp.nexus-oracle.example/', version: '2025-06-18' },
      ],
      active: true,
      x402Support: true,
    },
  },
  {
    agentId: 2n,
    uri: 'ipfs://QmMockAgent2',
    owner: '0x2345678901234567890123456789012345678901',
    wallet: '0x2345678901234567890123456789012345678901',
    name: 'AURA_YIELD_BOT',
    description:
      'Automated yield optimization across DeFi protocols. Auto-compounds rewards and rebalances positions for maximum APY.',
    image: null,
    categories: ['DeFi', 'Yield', 'Trading'],
    metadata: {
      type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
      name: 'AURA_YIELD_BOT',
      description: 'Automated yield optimization across DeFi protocols.',
      services: [
        { name: 'A2A', endpoint: 'https://aura-yield.example/.well-known/agent-card.json', version: '0.3.0' },
      ],
      active: true,
      x402Support: true,
    },
  },
  {
    agentId: 3n,
    uri: 'ipfs://QmMockAgent3',
    owner: '0x3456789012345678901234567890123456789012',
    wallet: '0x3456789012345678901234567890123456789012',
    name: 'CONTENT_ENGINE_X',
    description:
      'AI-powered content generation for marketing and social media. Creates engaging copy, images, and video scripts on-demand.',
    image: null,
    categories: ['Content', 'Media', 'Marketing'],
    metadata: {
      type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
      name: 'CONTENT_ENGINE_X',
      description: 'AI-powered content generation for marketing and social media.',
      services: [
        { name: 'MCP', endpoint: 'https://mcp.content-engine.example/', version: '2025-06-18' },
        { name: 'web', endpoint: 'https://content-engine.example/' },
      ],
      active: true,
      x402Support: false,
    },
  },
  {
    agentId: 4n,
    uri: 'ipfs://QmMockAgent4',
    owner: '0x4567890123456789012345678901234567890123',
    wallet: '0x4567890123456789012345678901234567890123',
    name: 'TRADE_SIGNAL_PRO',
    description:
      'Advanced trading signals and market analysis. Provides entry/exit points with risk ratings and portfolio management.',
    image: null,
    categories: ['Trading', 'Analysis', 'DeFi'],
    metadata: {
      type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
      name: 'TRADE_SIGNAL_PRO',
      description: 'Advanced trading signals and market analysis.',
      services: [
        { name: 'A2A', endpoint: 'https://trade-signal.example/.well-known/agent-card.json', version: '0.3.0' },
      ],
      active: true,
      x402Support: true,
    },
  },
  {
    agentId: 5n,
    uri: 'ipfs://QmMockAgent5',
    owner: '0x5678901234567890123456789012345678901234',
    wallet: '0x5678901234567890123456789012345678901234',
    name: 'RISKY_TRADER_BOT',
    description:
      'Experimental high-frequency trading bot. Aggressive risk profile — not recommended for large capital.',
    image: null,
    categories: ['Trading'],
    metadata: {
      type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
      name: 'RISKY_TRADER_BOT',
      description: 'Experimental trading bot with aggressive strategies.',
      services: [],
      active: true,
      x402Support: false,
    },
  },
  {
    agentId: 6n,
    uri: 'ipfs://QmMockAgent6',
    owner: '0x6789012345678901234567890123456789012345',
    wallet: '0x6789012345678901234567890123456789012345',
    name: 'AUDIT_SHERLOCK_AI',
    description:
      'Smart contract audit specialist. Detects vulnerabilities, reentrancy bugs, and logical errors across EVM-compatible chains.',
    image: null,
    categories: ['Security', 'Audit', 'DeFi'],
    metadata: {
      type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
      name: 'AUDIT_SHERLOCK_AI',
      description: 'Smart contract audit specialist.',
      services: [
        { name: 'MCP', endpoint: 'https://mcp.audit-sherlock.example/', version: '2025-06-18' },
        { name: 'web', endpoint: 'https://audit-sherlock.example/' },
      ],
      active: true,
      x402Support: true,
    },
  },
  {
    agentId: 7n,
    uri: 'ipfs://QmMockAgent7',
    owner: '0x7890123456789012345678901234567890123456',
    wallet: '0x7890123456789012345678901234567890123456',
    name: 'BRIDGE_NAVIGATOR',
    description:
      'Cross-chain bridge routing optimizer. Finds cheapest and fastest routes across 30+ chains and 50+ bridges.',
    image: null,
    categories: ['Infrastructure', 'Bridge', 'DeFi'],
    metadata: {
      type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
      name: 'BRIDGE_NAVIGATOR',
      description: 'Cross-chain bridge routing optimizer.',
      services: [
        { name: 'A2A', endpoint: 'https://bridge-navigator.example/.well-known/agent-card.json', version: '0.3.0' },
      ],
      active: true,
      x402Support: true,
    },
  },
  {
    agentId: 8n,
    uri: 'ipfs://QmMockAgent8',
    owner: '0x8901234567890123456789012345678901234567',
    wallet: '0x8901234567890123456789012345678901234567',
    name: 'NOVA_CODER_PRIME',
    description:
      'Autonomous software engineer. Writes, tests, and deploys production-ready code from natural language specs.',
    image: null,
    categories: ['Development', 'Code', 'Automation'],
    metadata: {
      type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
      name: 'NOVA_CODER_PRIME',
      description: 'Autonomous software engineer.',
      services: [
        { name: 'MCP', endpoint: 'https://mcp.nova-coder.example/', version: '2025-06-18' },
        { name: 'A2A', endpoint: 'https://nova-coder.example/.well-known/agent-card.json', version: '0.3.0' },
      ],
      active: true,
      x402Support: true,
    },
  },
]

// ─────────────────────────────────────────────────────────────
// MOCK JOB DATA (ERC-8183 Agentic Commerce)
// ─────────────────────────────────────────────────────────────

function makeJobs(wallet, count, completedCount, rejectedCount, expiredCount = 0, hasSybil = false) {
  return Array.from({ length: count }, (_, i) => {
    let status, statusName
    if (i < completedCount) { status = 3; statusName = 'Completed' }
    else if (i < completedCount + rejectedCount) { status = 4; statusName = 'Rejected' }
    else if (i < completedCount + rejectedCount + expiredCount) { status = 5; statusName = 'Expired' }
    else { status = 1; statusName = 'Funded' }

    // Sybil: first 5 jobs have provider === client if hasSybil is true
    const isSybilJob = hasSybil && i < 5
    const clientAddr = isSybilJob
      ? wallet
      : `0x${(i % 89 + 10).toString(16).padStart(40, '0')}`

    const budgetNum = (Math.random() * 50000 + 200)
    return {
      jobId: BigInt(wallet.slice(2, 6) + i),
      client: clientAddr,
      provider: wallet,
      evaluator: '0x9999999999999999999999999999999999999999',
      description: 'Agent task execution',
      budget: BigInt(Math.floor(budgetNum * 1e6)),
      budgetUsd: budgetNum.toFixed(2),
      expiredAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      status,
      statusName,
      hook: '0x0000000000000000000000000000000000000000',
      deliverable: status >= 2 ? '0x' + 'ab'.repeat(32) : null,
      completionReason: status === 3 ? '0x' + 'cd'.repeat(32) : null,
      rejectionReason: status === 4 ? '0x' + 'ef'.repeat(32) : null,
      createdAt: BigInt(18000000 + i * 100),
    }
  })
}

const MOCK_JOBS = {
  '0x1234567890123456789012345678901234567890': makeJobs('0x1234567890123456789012345678901234567890', 435, 412, 23),
  '0x2345678901234567890123456789012345678901': makeJobs('0x2345678901234567890123456789012345678901', 286, 282, 4),
  '0x3456789012345678901234567890123456789012': makeJobs('0x3456789012345678901234567890123456789012', 156, 148, 5, 3),
  '0x4567890123456789012345678901234567890123': makeJobs('0x4567890123456789012345678901234567890123', 569, 555, 14),
  '0x5678901234567890123456789012345678901234': makeJobs('0x5678901234567890123456789012345678901234', 47, 24, 16, 7, true),
  '0x6789012345678901234567890123456789012345': makeJobs('0x6789012345678901234567890123456789012345', 203, 199, 4),
  '0x7890123456789012345678901234567890123456': makeJobs('0x7890123456789012345678901234567890123456', 91, 85, 4, 2),
  '0x8901234567890123456789012345678901234567': makeJobs('0x8901234567890123456789012345678901234567', 312, 304, 8),
}

// ─────────────────────────────────────────────────────────────
// MOCK REPUTATION (ERC-8004 Reputation Registry)
// ─────────────────────────────────────────────────────────────
const MOCK_REPUTATION = {
  1: { count: 89, averageScore: 94.5, uniqueClients: 89, feedback: [] },
  2: { count: 47, averageScore: 91.2, uniqueClients: 47, feedback: [] },
  3: { count: 34, averageScore: 87.8, uniqueClients: 34, feedback: [] },
  4: { count: 120, averageScore: 96.1, uniqueClients: 120, feedback: [] },
  5: { count: 15, averageScore: 42.5, uniqueClients: 12, feedback: [] },
  6: { count: 67, averageScore: 98.0, uniqueClients: 67, feedback: [] },
  7: { count: 31, averageScore: 89.3, uniqueClients: 31, feedback: [] },
  8: { count: 78, averageScore: 93.7, uniqueClients: 78, feedback: [] },
}

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────

/** Get all mock agents */
export function getMockAgents() {
  return [...MOCK_AGENTS]
}

/** Get single mock agent by ID */
export function getMockAgentById(agentId) {
  const id = Number(agentId)
  return MOCK_AGENTS.find((a) => Number(a.agentId) === id) || null
}

/** Get mock jobs for a provider wallet address */
export function getMockJobs(providerAddress) {
  if (!providerAddress) return []
  const addr = providerAddress.toLowerCase()
  for (const [wallet, jobs] of Object.entries(MOCK_JOBS)) {
    if (wallet.toLowerCase() === addr) return jobs
  }
  return []
}

/** Get mock reputation data for an agent */
export function getMockReputation(agentId) {
  return (
    MOCK_REPUTATION[Number(agentId)] || {
      count: 0,
      averageScore: 0,
      uniqueClients: 0,
      feedback: [],
    }
  )
}
