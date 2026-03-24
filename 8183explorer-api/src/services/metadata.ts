/**
 * Fetch and parse agent metadata from any URI format:
 * - data:application/json;base64,...
 * - ipfs://CID
 * - https://...
 */

const IPFS_GATEWAYS = [
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
]

const FETCH_TIMEOUT_MS = 8_000

export interface AgentMetadata {
  name?:        string
  description?: string
  image?:       string
  categories?:  string[]
  services?:    Array<{ name: string; endpoint: string; version?: string }>
  active?:      boolean
  x402Support?: boolean
  [key: string]: unknown
}

export async function fetchMetadataFromURI(uri: string): Promise<AgentMetadata | null> {
  if (!uri) return null

  try {
    // base64 inline JSON
    if (uri.startsWith('data:application/json')) {
      const base64 = uri.split(',')[1]
      if (!base64) return null
      const json = Buffer.from(base64, 'base64').toString('utf8')
      return JSON.parse(json)
    }

    // IPFS — try gateways in order
    if (uri.startsWith('ipfs://')) {
      const cid = uri.slice(7)
      for (const gateway of IPFS_GATEWAYS) {
        try {
          const res = await fetch(gateway + cid, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
          if (res.ok) return await res.json()
        } catch {
          // try next gateway
        }
      }
      console.warn(`[metadata] All IPFS gateways failed for ${uri}`)
      return null
    }

    // HTTPS
    if (uri.startsWith('https://') || uri.startsWith('http://')) {
      const res = await fetch(uri, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    }

    console.warn(`[metadata] Unknown URI format: ${uri}`)
    return null
  } catch (err) {
    console.warn(`[metadata] Failed to fetch ${uri}:`, (err as Error).message)
    return null
  }
}

export function extractCategories(metadata: AgentMetadata | null): string[] {
  if (!metadata) return []
  if (Array.isArray(metadata.categories)) return metadata.categories

  const name = (metadata.name ?? '').toLowerCase()
  const desc = (metadata.description ?? '').toLowerCase()
  const text = `${name} ${desc}`

  const map: Record<string, string[]> = {
    DeFi:    ['defi', 'yield', 'liquidity', 'swap', 'lending'],
    Trading: ['trade', 'signal', 'market', 'price', 'arbitrage'],
    Oracle:  ['oracle', 'price feed', 'data feed', 'real-time'],
    NFT:     ['nft', 'collection', 'mint'],
    Content: ['content', 'marketing', 'generation', 'copywriting'],
    Data:    ['data', 'analytics', 'indexer', 'scraper'],
    Security:['audit', 'security', 'risk'],
  }

  return Object.entries(map)
    .filter(([, keywords]) => keywords.some(k => text.includes(k)))
    .map(([cat]) => cat)
}
