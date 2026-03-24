import { formatEther } from 'viem'
import { viemClient, ADDRESSES, IDENTITY_ABI, COMMERCE_ABI, EVENTS, BLOCK_CHUNK_SIZE, START_BLOCK } from '../config.ts'
import { pool } from '../db/client.ts'
import { fetchMetadataFromURI, extractCategories } from './metadata.ts'

// ── State helpers ─────────────────────────────────────────────────────────────

async function getLastIndexedBlock(): Promise<bigint> {
  const res = await pool.query<{ value: string }>(
    "SELECT value FROM indexer_state WHERE key = 'last_indexed_block'"
  )
  return BigInt(res.rows[0]?.value ?? 0)
}

async function setLastIndexedBlock(block: bigint): Promise<void> {
  await pool.query(
    "INSERT INTO indexer_state (key, value) VALUES ('last_indexed_block', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
    [block.toString()]
  )
}

// ── Agent upserts ─────────────────────────────────────────────────────────────

async function upsertAgent(agentId: bigint, uri: string, owner: string, wallet: string, block: bigint) {
  const metadata = await fetchMetadataFromURI(uri)
  const categories = extractCategories(metadata)

  await pool.query(`
    INSERT INTO agents (agent_id, network, source, uri, owner_address, wallet_address, name, description, image_uri, categories, services, active, registered_block, registered_at, updated_at)
    VALUES ($1, 'base_sepolia', 'local', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12)
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
    agentId.toString(),
    uri,
    owner,
    wallet,
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
    "UPDATE agents SET wallet_address = $1, updated_at = $2 WHERE agent_id = $3 AND network = 'base_sepolia'",
    [wallet, Math.floor(Date.now() / 1000), agentId.toString()]
  )
}

async function updateAgentURI(agentId: bigint, uri: string) {
  const metadata = await fetchMetadataFromURI(uri)
  const categories = extractCategories(metadata)
  await pool.query(`
    UPDATE agents SET
      uri = $1, name = $2, description = $3, image_uri = $4,
      categories = $5, services = $6, active = $7, updated_at = $8
    WHERE agent_id = $9 AND network = 'base_sepolia'
  `, [
    uri,
    metadata?.name ?? null,
    metadata?.description ?? null,
    metadata?.image ?? null,
    categories,
    JSON.stringify(metadata?.services ?? []),
    metadata?.active ?? true,
    Math.floor(Date.now() / 1000),
    agentId.toString(),
  ])
}

// ── Job upserts ───────────────────────────────────────────────────────────────

async function upsertJob(
  jobId: bigint, client: string, provider: string, evaluator: string,
  expiredAt: bigint, block: bigint
) {
  // Fetch budget from contract
  let budgetWei = '0'
  try {
    const job = await viemClient.readContract({
      address: ADDRESSES.agenticCommerce,
      abi: COMMERCE_ABI,
      functionName: 'getJob',
      args: [jobId],
    })
    budgetWei = (job as any).budget?.toString() ?? '0'
  } catch {}

  await pool.query(`
    INSERT INTO jobs (job_id, client_address, provider_address, evaluator_address, budget_wei, expired_at, status, created_block, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, 0, $7, $8)
    ON CONFLICT (job_id) DO NOTHING
  `, [
    jobId.toString(), client, provider, evaluator,
    budgetWei, expiredAt.toString(), block.toString(),
    Math.floor(Date.now() / 1000),
  ])
}

async function updateJobStatus(jobId: bigint, status: number, completedAt?: number) {
  if (completedAt !== undefined) {
    await pool.query(
      'UPDATE jobs SET status = $1, completed_at = $2 WHERE job_id = $3',
      [status, completedAt, jobId.toString()]
    )
  } else {
    await pool.query(
      'UPDATE jobs SET status = $1 WHERE job_id = $2',
      [status, jobId.toString()]
    )
  }
}

// ── Feedback upserts ──────────────────────────────────────────────────────────

async function upsertFeedback(
  agentId: bigint, client: string, index: bigint,
  value: bigint, decimals: number, tag1: string, tag2: string,
  endpoint: string, feedbackUri: string, block: bigint
) {
  await pool.query(`
    INSERT INTO feedback (agent_id, client_address, feedback_index, value, value_decimals, tag1, tag2, endpoint, feedback_uri, given_block, given_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (agent_id, client_address, feedback_index) DO NOTHING
  `, [
    agentId.toString(), client, index.toString(),
    value.toString(), decimals, tag1, tag2,
    endpoint, feedbackUri, block.toString(),
    Math.floor(Date.now() / 1000),
  ])
}

async function revokeFeedback(agentId: bigint, client: string, index: bigint) {
  await pool.query(
    'UPDATE feedback SET is_revoked = true WHERE agent_id = $1 AND client_address = $2 AND feedback_index = $3',
    [agentId.toString(), client, index.toString()]
  )
}

// ── Bootstrap: sync agents directly from contract (reliable fallback) ─────────

export async function bootstrapAgents(): Promise<void> {
  try {
    const total = await viemClient.readContract({
      address: ADDRESSES.identityRegistry,
      abi: IDENTITY_ABI,
      functionName: 'totalSupply',
    })
    const count = Number(total)
    if (count === 0) return
    console.log(`[indexer] Bootstrapping ${count} agents from contract...`)

    const ids = Array.from({ length: count }, (_, i) => BigInt(i + 1))

    const calls = ids.flatMap(id => [
      { address: ADDRESSES.identityRegistry, abi: IDENTITY_ABI, functionName: 'tokenURI',      args: [id] },
      { address: ADDRESSES.identityRegistry, abi: IDENTITY_ABI, functionName: 'ownerOf',       args: [id] },
      { address: ADDRESSES.identityRegistry, abi: IDENTITY_ABI, functionName: 'getAgentWallet', args: [id] },
    ])

    const results = await viemClient.multicall({ contracts: calls as any[] })

    for (let i = 0; i < ids.length; i++) {
      const agentId = ids[i]
      const uriResult    = results[i * 3]
      const ownerResult  = results[i * 3 + 1]
      const walletResult = results[i * 3 + 2]

      if (uriResult.status === 'failure') {
        console.warn(`[indexer] Bootstrap: skipping agent ${agentId} (tokenURI failed)`)
        continue
      }

      const uri    = uriResult.result as string
      const owner  = ownerResult.result as string
      const wallet = (walletResult.result as string) || owner

      await upsertAgent(agentId, uri, owner, wallet, 0n)
    }
    console.log(`[indexer] Bootstrap complete: ${count} agents synced`)
  } catch (err) {
    console.error('[indexer] Bootstrap failed:', (err as Error).message)
  }
}

// ── Main sync function ────────────────────────────────────────────────────────

export async function syncChunk(fromBlock: bigint, toBlock: bigint): Promise<void> {
  console.log(`[indexer] Syncing blocks ${fromBlock} → ${toBlock}`)

  const [
    registeredLogs,
    walletSetLogs,
    uriUpdatedLogs,
    jobCreatedLogs,
    jobFundedLogs,
    jobCompletedLogs,
    jobRejectedLogs,
    jobExpiredLogs,
    feedbackLogs,
    revokedLogs,
  ] = await Promise.all([
    viemClient.getLogs({ address: ADDRESSES.identityRegistry,   event: EVENTS.Registered,      fromBlock, toBlock }),
    viemClient.getLogs({ address: ADDRESSES.identityRegistry,   event: EVENTS.AgentWalletSet,  fromBlock, toBlock }),
    viemClient.getLogs({ address: ADDRESSES.identityRegistry,   event: EVENTS.URIUpdated,       fromBlock, toBlock }),
    viemClient.getLogs({ address: ADDRESSES.agenticCommerce,    event: EVENTS.JobCreated,       fromBlock, toBlock }),
    viemClient.getLogs({ address: ADDRESSES.agenticCommerce,    event: EVENTS.JobFunded,        fromBlock, toBlock }),
    viemClient.getLogs({ address: ADDRESSES.agenticCommerce,    event: EVENTS.JobCompleted,     fromBlock, toBlock }),
    viemClient.getLogs({ address: ADDRESSES.agenticCommerce,    event: EVENTS.JobRejected,      fromBlock, toBlock }),
    viemClient.getLogs({ address: ADDRESSES.agenticCommerce,    event: EVENTS.JobExpired,       fromBlock, toBlock }),
    viemClient.getLogs({ address: ADDRESSES.reputationRegistry, event: EVENTS.NewFeedback,      fromBlock, toBlock }),
    viemClient.getLogs({ address: ADDRESSES.reputationRegistry, event: EVENTS.FeedbackRevoked,  fromBlock, toBlock }),
  ])

  // Process in dependency order
  for (const log of registeredLogs) {
    const { agentId, agentURI, owner } = log.args as any
    // Fetch wallet from contract (register() sets it to owner)
    let wallet = owner
    try {
      wallet = await viemClient.readContract({
        address: ADDRESSES.identityRegistry,
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

  for (const log of jobCreatedLogs) {
    const { jobId, client, provider, evaluator, expiredAt } = log.args as any
    await upsertJob(jobId, client, provider, evaluator, expiredAt, log.blockNumber)
  }

  for (const log of jobFundedLogs) {
    const { jobId } = log.args as any
    await updateJobStatus(jobId, 1)
  }

  for (const log of jobCompletedLogs) {
    const { jobId } = log.args as any
    await updateJobStatus(jobId, 3, Math.floor(Date.now() / 1000))
  }

  for (const log of jobRejectedLogs) {
    const { jobId } = log.args as any
    await updateJobStatus(jobId, 4, Math.floor(Date.now() / 1000))
  }

  for (const log of jobExpiredLogs) {
    const { jobId } = log.args as any
    await updateJobStatus(jobId, 5)
  }

  for (const log of feedbackLogs) {
    const { agentId, clientAddress, feedbackIndex, value, valueDecimals, tag1, tag2, endpoint, feedbackURI } = log.args as any
    await upsertFeedback(
      agentId, clientAddress, feedbackIndex,
      value, Number(valueDecimals), tag1 ?? '', tag2 ?? '',
      endpoint ?? '', feedbackURI ?? '', log.blockNumber
    )
  }

  for (const log of revokedLogs) {
    const { agentId, clientAddress, feedbackIndex } = log.args as any
    await revokeFeedback(agentId, clientAddress, feedbackIndex)
  }

  const totalEvents = registeredLogs.length + jobCreatedLogs.length + feedbackLogs.length
    + jobCompletedLogs.length + jobRejectedLogs.length
  if (totalEvents > 0) {
    console.log(`[indexer] Processed: ${registeredLogs.length} agents, ${jobCreatedLogs.length} jobs, ${feedbackLogs.length} feedback, ${jobCompletedLogs.length + jobRejectedLogs.length} job updates`)
  }
}

export async function runIndexer(): Promise<void> {
  try {
    const currentBlock = await viemClient.getBlockNumber()
    const savedBlock   = await getLastIndexedBlock()
    // Use START_BLOCK if this is the first run (savedBlock === 0)
    const lastBlock    = savedBlock === 0n ? START_BLOCK - 1n : savedBlock

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
    console.error('[indexer] Error during sync:', (err as Error).message)
  }
}
