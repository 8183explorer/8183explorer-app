import { createPublicClient, http, fallback } from 'viem'
import { base, baseSepolia } from 'viem/chains'

// ════════════════════════════════════════════════════════════
// CONTRACT ADDRESSES
// ════════════════════════════════════════════════════════════

export const CONTRACTS = {
  // ERC-8004 AgentRegistry + ReputationRegistry (both on Base / Base Sepolia)
  erc8004: {
    identity: {
      base: null,                                       // Update when deployed to Base mainnet
      baseSepolia: '0x03bF6389eE5884884b1459877d3e9576492Eb1E1',
    },
    reputation: {
      base: null,                                       // Update when deployed to Base mainnet
      baseSepolia: '0x552C798370A1B1C9e0988B9B30103e2da058e7Ba',
    },
  },

  // ERC-8183 AgenticCommerce (Base / Base Sepolia)
  erc8183: {
    commerce: {
      base: null,                                       // Update when deployed to Base mainnet
      baseSepolia: '0x5D8e20e2247d38e0A64B78Bc7B6f2Fe06CEBE0B7',
    },
  },
}

// ════════════════════════════════════════════════════════════
// ENVIRONMENT CONFIG
// ════════════════════════════════════════════════════════════

export const ENV = {
  // Use testnet for development
  isProduction: import.meta.env.PROD,

  // All contracts are on Base / Base Sepolia
  erc8004Chain: import.meta.env.PROD ? base : baseSepolia,
  erc8183Chain: import.meta.env.PROD ? base : baseSepolia,

  // Mock mode: true only when address is null/undefined
  get useERC8004Mock() {
    const network = this.isProduction ? 'base' : 'baseSepolia'
    const addr = CONTRACTS.erc8004.identity[network]
    return !addr
  },

  get useERC8183Mock() {
    const network = this.isProduction ? 'base' : 'baseSepolia'
    const addr = CONTRACTS.erc8183.commerce[network]
    return !addr
  },
}

// ════════════════════════════════════════════════════════════
// ACTIVE ADDRESSES (based on environment)
// ════════════════════════════════════════════════════════════

export function getActiveAddresses() {
  const network = ENV.isProduction ? 'base' : 'baseSepolia'

  return {
    identityRegistry:   CONTRACTS.erc8004.identity[network],
    reputationRegistry: CONTRACTS.erc8004.reputation[network],
    agenticCommerce:    CONTRACTS.erc8183.commerce[network],
  }
}

// ════════════════════════════════════════════════════════════
// VIEM CLIENTS
// ════════════════════════════════════════════════════════════

// Base Sepolia (dev) — primary + fallback RPC
const baseSepoliaTransport = fallback([
  http('https://sepolia.base.org'),
  http('https://base-sepolia-rpc.publicnode.com'),
])

// Base Mainnet (prod)
const baseTransport = fallback([
  http('https://mainnet.base.org'),
  http('https://base.llamarpc.com'),
  http('https://base.drpc.org'),
])

// ethClient — used for ERC-8004 (AgentRegistry + ReputationRegistry)
export const ethClient = createPublicClient({
  chain: ENV.erc8004Chain,
  transport: ENV.isProduction ? baseTransport : baseSepoliaTransport,
  batch: { multicall: true },
})

// baseClient — used for ERC-8183 (AgenticCommerce)
export const baseClient = createPublicClient({
  chain: ENV.erc8183Chain,
  transport: ENV.isProduction ? baseTransport : baseSepoliaTransport,
  batch: { multicall: true },
})

// ════════════════════════════════════════════════════════════
// CONTRACT ABIs (human-readable for Viem)
// ════════════════════════════════════════════════════════════

export const IDENTITY_ABI = [
  // ERC-721 standard
  'function totalSupply() view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function tokenByIndex(uint256 index) view returns (uint256)',
  // IAgentRegistry extensions
  'function getAgentWallet(uint256 agentId) view returns (address)',
  'function getMetadata(uint256 agentId, string key) view returns (bytes)',
  // Events
  'event Registered(uint256 indexed agentId, string agentURI, address indexed owner)',
  'event URIUpdated(uint256 indexed agentId, string newURI, address indexed updatedBy)',
  'event AgentWalletSet(uint256 indexed agentId, address indexed wallet)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
]

export const REPUTATION_ABI = [
  // IReputationRegistry
  'function getSummary(uint256 agentId, address[] clientAddresses, string tag1, string tag2) view returns (uint64 count, int128 summaryValue, uint8 summaryValueDecimals)',
  'function getClients(uint256 agentId) view returns (address[])',
  'function readAllFeedback(uint256 agentId, address[] clientAddresses, string tag1, string tag2, bool includeRevoked) view returns (address[] clients, uint64[] indexes, int128[] values, uint8[] valueDecimals, string[] tag1s, string[] tag2s, bool[] revokedStatuses)',
  'function getLastIndex(uint256 agentId, address clientAddress) view returns (uint64)',
  // Events
  'event NewFeedback(uint256 indexed agentId, address indexed clientAddress, uint64 feedbackIndex, int128 value, uint8 valueDecimals, string indexed indexedTag1, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash)',
  'event FeedbackRevoked(uint256 indexed agentId, address indexed clientAddress, uint64 indexed feedbackIndex)',
]

export const COMMERCE_ABI = [
  // IAgenticCommerce
  // getJob returns a Job struct — viem decodes it as a named object
  'function getJob(uint256 jobId) view returns ((uint256 id, address client, address provider, address evaluator, string description, uint256 budget, uint256 expiredAt, uint8 status, address hook))',
  'function jobCounter() view returns (uint256)',
  // Events
  'event JobCreated(uint256 indexed jobId, address indexed client, address indexed provider, address evaluator, uint256 expiredAt, address hook)',
  'event JobFunded(uint256 indexed jobId, address indexed client, uint256 amount)',
  'event JobSubmitted(uint256 indexed jobId, address indexed provider, bytes32 deliverable)',
  'event JobCompleted(uint256 indexed jobId, address indexed evaluator, bytes32 reason)',
  'event JobRejected(uint256 indexed jobId, address indexed rejector, bytes32 reason)',
  'event JobExpired(uint256 indexed jobId)',
]

// Job status enum → readable label
export const JOB_STATUS = {
  0: 'Open',
  1: 'Funded',
  2: 'Submitted',
  3: 'Completed',
  4: 'Rejected',
  5: 'Expired',
}
