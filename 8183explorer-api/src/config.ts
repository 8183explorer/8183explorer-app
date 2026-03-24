import { createPublicClient, http, fallback, parseAbi, parseAbiItem } from 'viem'
import { baseSepolia, base } from 'viem/chains'

// ── Env ─────────────────────────────────────────────────────────────────────

export const PORT             = Number(process.env.PORT            ?? 3001)
export const POLL_INTERVAL_MS = Number(process.env.POLL_INTERVAL_MS ?? 12_000)
export const BLOCK_CHUNK_SIZE = BigInt(process.env.BLOCK_CHUNK_SIZE ?? 2_000)
export const ETH_PRICE_USD    = Number(process.env.ETH_PRICE_USD    ?? 3_500)
export const START_BLOCK      = BigInt(process.env.START_BLOCK      ?? 0)

export const MAINNET_RPC_URL          = process.env.MAINNET_RPC_URL          ?? 'https://mainnet.base.org'
export const MAINNET_RPC_URL_FALLBACK = process.env.MAINNET_RPC_URL_FALLBACK ?? 'https://base-rpc.publicnode.com'
export const ENABLE_ERC8004_INDEXER   = (process.env.ENABLE_ERC8004_INDEXER  ?? 'true') === 'true'
export const ERC8004_START_BLOCK      = BigInt(process.env.ERC8004_START_BLOCK ?? 0)

// ── Contract addresses ───────────────────────────────────────────────────────

export const ADDRESSES = {
  identityRegistry:   '0x03bF6389eE5884884b1459877d3e9576492Eb1E1' as `0x${string}`,
  reputationRegistry: '0x552C798370A1B1C9e0988B9B30103e2da058e7Ba' as `0x${string}`,
  agenticCommerce:    '0x5D8e20e2247d38e0A64B78Bc7B6f2Fe06CEBE0B7' as `0x${string}`,
}

// ERC-8004 Base Mainnet (official deployment)
export const ADDRESSES_ERC8004 = {
  identityRegistry:   '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432' as `0x${string}`,
  reputationRegistry: '0x8004BAa17C55a88189AE136b182e5fdA19dE9b63' as `0x${string}`,
}

// ── ABIs ─────────────────────────────────────────────────────────────────────

export const IDENTITY_ABI = parseAbi([
  'function totalSupply() view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function getAgentWallet(uint256 agentId) view returns (address)',
])

export const REPUTATION_ABI = parseAbi([
  'function getClients(uint256 agentId) view returns (address[])',
  'function getSummary(uint256 agentId, address[] clientAddresses, string tag1, string tag2) view returns (uint64 count, int128 summaryValue, uint8 summaryValueDecimals)',
])

export const COMMERCE_ABI = parseAbi([
  'function getJob(uint256 jobId) view returns ((uint256 id, address client, address provider, address evaluator, string description, uint256 budget, uint256 expiredAt, uint8 status, address hook))',
  'function jobCounter() view returns (uint256)',
])

// ── Events ───────────────────────────────────────────────────────────────────

export const EVENTS = {
  Registered:      parseAbiItem('event Registered(uint256 indexed agentId, string agentURI, address indexed owner)'),
  AgentWalletSet:  parseAbiItem('event AgentWalletSet(uint256 indexed agentId, address indexed wallet)'),
  URIUpdated:      parseAbiItem('event URIUpdated(uint256 indexed agentId, string newURI, address indexed updatedBy)'),
  JobCreated:      parseAbiItem('event JobCreated(uint256 indexed jobId, address indexed client, address indexed provider, address evaluator, uint256 expiredAt, address hook)'),
  JobFunded:       parseAbiItem('event JobFunded(uint256 indexed jobId, address indexed client, uint256 amount)'),
  JobSubmitted:    parseAbiItem('event JobSubmitted(uint256 indexed jobId, address indexed provider, bytes32 deliverable)'),
  JobCompleted:    parseAbiItem('event JobCompleted(uint256 indexed jobId, address indexed evaluator, bytes32 reason)'),
  JobRejected:     parseAbiItem('event JobRejected(uint256 indexed jobId, address indexed rejector, bytes32 reason)'),
  JobExpired:      parseAbiItem('event JobExpired(uint256 indexed jobId)'),
  NewFeedback:     parseAbiItem('event NewFeedback(uint256 indexed agentId, address indexed clientAddress, uint64 feedbackIndex, int128 value, uint8 valueDecimals, string indexed indexedTag1, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash)'),
  FeedbackRevoked: parseAbiItem('event FeedbackRevoked(uint256 indexed agentId, address indexed clientAddress, uint64 indexed feedbackIndex)'),
}

// ── Viem clients ─────────────────────────────────────────────────────────────

export const viemClient = createPublicClient({
  chain: baseSepolia,
  transport: fallback([
    http(process.env.RPC_URL          ?? 'https://sepolia.base.org'),
    http(process.env.RPC_URL_FALLBACK ?? 'https://base-sepolia-rpc.publicnode.com'),
  ]),
  batch: { multicall: true },
})

export const viemClientMainnet = createPublicClient({
  chain: base,
  transport: fallback([
    http(MAINNET_RPC_URL),
    http(MAINNET_RPC_URL_FALLBACK),
  ]),
  batch: { multicall: true },
})

// ── Job status ────────────────────────────────────────────────────────────────

export const JOB_STATUS: Record<number, string> = {
  0: 'Open',
  1: 'Funded',
  2: 'Submitted',
  3: 'Completed',
  4: 'Rejected',
  5: 'Expired',
}
