import {
  viemClientMainnet, ADDRESSES_ERC8004, IDENTITY_ABI, EVENTS,
  BLOCK_CHUNK_SIZE,
} from '../config.ts'
import { pool } from '../db/client.ts'
import { fetchMetadataFromURI, extractCategories } from './metadata.ts'

const NETWORK   = 'base_mainnet'
const SOURCE    = 'erc8004'
const STATE_KEY = 'last_indexed_block_erc8004_mainnet'

// ── State helpers ─────────────────────────────────────────────────────────────

async function getLastIndexedBlock(): Promise<bigint> {
  const res = await pool.query<{ value: string }>(
    "SELECT value FROM indexer_state WHERE key = $1", [STATE_KEY]
  )
  return BigInt(res.rows[0]?.value ?? 0)
}

async function setLastIndexedBlock(block: bigint): Promise<void> {
  await pool.query(
    "INSERT INTO indexer_state (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2",
    [STATE_KEY, block.toString()]
  )
}

// ── Agent upserts ─────────────────────────────────────────────────────────────

async function upsertAgent(agentId: bigint, uri: string, owner: string, wallet: string, block: bigint) {
  const metadata  = await fetchMetadataFromURI(uri)
  const categories = extractCategories(metadata)

  await pool.query(`
    INSERT INTO agents (agent_id, network, source, uri, owner_address, wallet_address, name, description, image_uri, categories, services, active, registered_block, registered_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $14)
    ON CONFLICT (agent_id, network) DO UPDATE SET
      uri              = EXCLUDED.uri,
      owner_address    = EXCLUDED.owner_address,
      wallet_address   = EXCLUDED.wallet_address,
      name             = EXCLUDED.name,
      description      = EXCLUDED.description,
      image_uri        = EXCLUDED.image_uri,
      categories       = EXCLUDED.categories,
      services         = EXCLUDED.services,
      active           = EXCLUDED.active,
      updated_at       = EXCLUDED.updated_at
  `, [
    agentId.toString(), NETWORK, SOURCE,
    uri, owner, wallet,
    metadata?.name ?? `Agent #${agentId}`,
    metadata?.description ?? '',
    metadata?.image ?? null,
    categories,
    JSON.stringify(metadata?.services ?? []),
    metadata?.active ?? true,
    block.toString(),
    Math.floor(Date.now() / 1000),
  ])
}

async function updateAgentWallet(agentId: bigint, wallet: string) {
  await pool.query(
    'UPDATE agents SET wallet_address = $1, updated_at = $2 WHERE agent_id = $3 AND network = $4',
    [wallet, Math.floor(Date.now() / 1000), agentId.toString(), NETWORK]
  )
}

async function updateAgentURI(agentId: bigint, uri: string) {
  const metadata   = await fetchMetadataFromURI(uri)
  const categories = extractCategories(metadata)
  await pool.query(`
    UPDATE agents SET
      uri = $1, name = $2, description = $3, image_uri = $4,
      categories = $5, services = $6, active = $7, updated_at = $8
    WHERE agent_id = $9 AND network = $10
  `, [
    uri,
    metadata?.name ?? null,
    metadata?.description ?? null,
    metadata?.image ?? null,
    categories,
    JSON.stringify(metadata?.services ?? []),
    metadata?.active ?? true,
    Math.floor(Date.now() / 1000),
    agentId.toString(), NETWORK,
  ])
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────

/** Binary search to find the last registered agent ID.
 *  tokenURI() reverts for non-existent IDs — O(log n) calls. */
async function findAgentCount(): Promise<bigint> {
  const canRead = async (id: bigint): Promise<boolean> => {
    try {
      await viemClientMainnet.readContract({
        address: ADDRESSES_ERC8004.identityRegistry,
        abi: IDENTITY_ABI,
        functionName: 'tokenURI',
        args: [id],
      })
      return true
    } catch {
      return false
    }
  }

  // Quick check: does agent 1 even exist?
  if (!(await canRead(1n))) return 0n

  // Exponential probe to find upper bound
  let hi = 1n
  while (hi <= 1_000_000n && await canRead(hi)) hi *= 2n

  // Binary search between hi/2 and hi
  let lo = hi / 2n
  while (lo < hi - 1n) {
    const mid = (lo + hi) / 2n
    if (await canRead(mid)) lo = mid
    else hi = mid
  }
  return lo
}

export async function bootstrapErc8004Agents(): Promise<void> {
  try {
    const currentBlock = await viemClientMainnet.getBlockNumber()
    let agentIds: bigint[] = []

    // Strategy 1: totalSupply()
    try {
      const total = await viemClientMainnet.readContract({
        address: ADDRESSES_ERC8004.identityRegistry,
        abi: IDENTITY_ABI,
        functionName: 'totalSupply',
      })
      const count = Number(total)
      agentIds = Array.from({ length: count }, (_, i) => BigInt(i + 1))
      console.log(`[indexer-erc8004] Found ${count} agents via totalSupply()`)
    } catch {}

    // Strategy 2: binary search on tokenURI (O(log n) calls, fast)
    if (agentIds.length === 0) {
      console.log('[indexer-erc8004] Finding agent count via binary search...')
      const count = await findAgentCount()
      if (count > 0n) {
        agentIds = Array.from({ length: Number(count) }, (_, i) => BigInt(i + 1))
        console.log(`[indexer-erc8004] Found ${count} agents via binary search`)
      }
    }

    if (agentIds.length === 0) {
      console.log('[indexer-erc8004] No agents found on Base Mainnet')
    } else {
      console.log(`[indexer-erc8004] Bootstrapping ${agentIds.length} agents from Base Mainnet...`)

      const BATCH = 50
      let synced = 0

      for (let i = 0; i < agentIds.length; i += BATCH) {
        const ids   = agentIds.slice(i, i + BATCH)
        const calls = ids.flatMap(id => [
          { address: ADDRESSES_ERC8004.identityRegistry, abi: IDENTITY_ABI, functionName: 'tokenURI',       args: [id] },
          { address: ADDRESSES_ERC8004.identityRegistry, abi: IDENTITY_ABI, functionName: 'ownerOf',        args: [id] },
          { address: ADDRESSES_ERC8004.identityRegistry, abi: IDENTITY_ABI, functionName: 'getAgentWallet', args: [id] },
        ])

        const results = await viemClientMainnet.multicall({ contracts: calls as any[] })

        for (let j = 0; j < ids.length; j++) {
          const agentId      = ids[j]
          const uriResult    = results[j * 3]
          const ownerResult  = results[j * 3 + 1]
          const walletResult = results[j * 3 + 2]

          if (uriResult.status === 'failure') continue

          const uri    = uriResult.result as string
          const owner  = ownerResult.result as string
          const wallet = (walletResult.result as string) || owner

          await upsertAgent(agentId, uri, owner, wallet, 0n)
          synced++
        }

        if (synced % 100 === 0 || i + BATCH >= agentIds.length) {
          console.log(`[indexer-erc8004] Bootstrap progress: ${synced}/${agentIds.length}`)
        }
      }

      console.log(`[indexer-erc8004] Bootstrap complete: ${synced} agents synced`)
    }

    // Set lastIndexedBlock to current so event sync starts from now (not genesis)
    const savedBlock = await getLastIndexedBlock()
    if (savedBlock === 0n) {
      await setLastIndexedBlock(currentBlock)
      console.log(`[indexer-erc8004] Event sync will start from block ${currentBlock}`)
    }
  } catch (err) {
    console.error('[indexer-erc8004] Bootstrap failed:', (err as Error).message)
  }
}

// ── Main sync ─────────────────────────────────────────────────────────────────

async function syncChunk(fromBlock: bigint, toBlock: bigint): Promise<void> {
  const [registeredLogs, walletSetLogs, uriUpdatedLogs] = await Promise.all([
    viemClientMainnet.getLogs({ address: ADDRESSES_ERC8004.identityRegistry, event: EVENTS.Registered,     fromBlock, toBlock }),
    viemClientMainnet.getLogs({ address: ADDRESSES_ERC8004.identityRegistry, event: EVENTS.AgentWalletSet, fromBlock, toBlock }),
    viemClientMainnet.getLogs({ address: ADDRESSES_ERC8004.identityRegistry, event: EVENTS.URIUpdated,     fromBlock, toBlock }),
  ])

  for (const log of registeredLogs) {
    const { agentId, agentURI, owner } = log.args as any
    let wallet = owner
    try {
      wallet = await viemClientMainnet.readContract({
        address: ADDRESSES_ERC8004.identityRegistry,
        abi: IDENTITY_ABI,
        functionName: 'getAgentWallet',
        args: [agentId],
      }) as string
    } catch {}
    await upsertAgent(agentId, agentURI, owner, wallet, log.blockNumber)
  }

  for (const log of walletSetLogs) {
    const { agentId, wallet } = log.args as any
    await updateAgentWallet(agentId, wallet)
  }

  for (const log of uriUpdatedLogs) {
    const { agentId, newURI } = log.args as any
    await updateAgentURI(agentId, newURI)
  }

  const total = registeredLogs.length + walletSetLogs.length + uriUpdatedLogs.length
  if (total > 0) {
    console.log(`[indexer-erc8004] Processed: ${registeredLogs.length} new agents, ${walletSetLogs.length} wallet updates, ${uriUpdatedLogs.length} URI updates`)
  }
}

export async function runErc8004Indexer(): Promise<void> {
  try {
    const currentBlock = await viemClientMainnet.getBlockNumber()
    const savedBlock   = await getLastIndexedBlock()
    const lastBlock    = savedBlock === 0n ? ERC8004_START_BLOCK - 1n : savedBlock

    if (lastBlock >= currentBlock) return

    let from = lastBlock + 1n
    while (from <= currentBlock) {
      const to = from + BLOCK_CHUNK_SIZE - 1n < currentBlock
        ? from + BLOCK_CHUNK_SIZE - 1n
        : currentBlock

      await syncChunk(from, to)
      await setLastIndexedBlock(to)
      from = to + 1n
    }
  } catch (err) {
    console.error('[indexer-erc8004] Error during sync:', (err as Error).message)
  }
}
