/**
 * Virtuals ACP Indexer
 * Syncs agents from acpx.virtuals.gg into our DB with source='virtuals_acp'.
 * Uses external_stats to store pre-aggregated job data from the ACP API.
 */

import { pool } from '../db/client.ts'

const ACP_API = 'https://acpx.virtuals.gg/api'
const ACP_NETWORK = 'base_sepolia'
const ACP_SOURCE  = 'virtuals_acp'
const ACP_ID_OFFSET = 10_000_000  // avoid conflicts with ERC-8004 agent IDs

interface AcpAgent {
  id: number
  name: string
  description: string | null
  walletAddress: string
  ownerAddress: string
  profilePic: string | null
  tokenAddress: string | null
  contractAddress: string | null
  offerings: Array<{ name: string; price: number; priceUsd?: number }>
  successfulJobCount: number
  successRate: number
  uniqueBuyerCount: number
  grossAgenticAmount: number | null
  lastActiveAt: string | null
  createdAt: string
  isHighRisk: boolean
  enabledChains: Array<{ id: number; name: string }>
  metrics: {
    successfulJobCount: number
    successRate: number
    uniqueBuyerCount: number
    isOnline: boolean
  } | null
}

async function fetchAllAcpAgents(): Promise<AcpAgent[]> {
  const allAgents: AcpAgent[] = []
  let page = 1
  let totalPages = 1

  while (page <= totalPages) {
    const url = `${ACP_API}/agents?pagination[page]=${page}&pagination[pageSize]=100`
    const res = await fetch(url)
    if (!res.ok) {
      console.error(`[ACP] Fetch failed page ${page}: ${res.status}`)
      break
    }
    const data = await res.json() as { data: AcpAgent[]; meta: { pagination: { pageCount: number; total: number } } }
    totalPages = data.meta.pagination.pageCount
    allAgents.push(...data.data)
    console.log(`[ACP] Fetched page ${page}/${totalPages} (${data.data.length} agents)`)
    page++

    // Small delay to be polite
    if (page <= totalPages) await new Promise(r => setTimeout(r, 300))
  }

  return allAgents
}

export async function syncAcpAgents(): Promise<{ upserted: number; total: number }> {
  console.log('[ACP] Starting sync from acpx.virtuals.gg...')
  const agents = await fetchAllAcpAgents()
  console.log(`[ACP] Total ACP agents fetched: ${agents.length}`)

  let upserted = 0

  for (const agent of agents) {
    const agentId   = ACP_ID_OFFSET + agent.id
    const wallet    = (agent.walletAddress ?? '').toLowerCase()
    const owner     = (agent.ownerAddress  ?? '').toLowerCase()
    const name      = agent.name ?? `ACP Agent #${agent.id}`
    const desc      = agent.description
    const imageUri  = agent.profilePic
    const services  = JSON.stringify(
      (agent.offerings ?? []).map(o => ({
        name:     o.name,
        price:    o.priceUsd ?? o.price,
        currency: 'USD',
      }))
    )

    // Determine registration timestamp from createdAt
    const registeredAt = agent.createdAt
      ? Math.floor(new Date(agent.createdAt).getTime() / 1000)
      : null

    // Store the ACP-provided stats as external_stats
    const metrics = agent.metrics ?? {}
    const externalStats = {
      source:             'virtuals_acp',
      documentId:         agent.documentId,
      successfulJobCount: agent.successfulJobCount ?? metrics.successfulJobCount ?? 0,
      successRate:        agent.successRate        ?? metrics.successRate        ?? 0,
      uniqueBuyerCount:   agent.uniqueBuyerCount   ?? metrics.uniqueBuyerCount   ?? 0,
      grossAgenticAmount: agent.grossAgenticAmount ?? null,
      isOnline:           metrics.isOnline ?? false,
      contractAddress:    agent.contractAddress,
      tokenAddress:       agent.tokenAddress,
      syncedAt:           new Date().toISOString(),
    }

    try {
      await pool.query(`
        INSERT INTO agents (
          agent_id, network, source, name, description, image_uri,
          wallet_address, owner_address, services, active,
          registered_at, external_stats
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (agent_id, network) DO UPDATE SET
          name           = EXCLUDED.name,
          description    = EXCLUDED.description,
          image_uri      = EXCLUDED.image_uri,
          wallet_address = EXCLUDED.wallet_address,
          owner_address  = EXCLUDED.owner_address,
          services       = EXCLUDED.services,
          active         = EXCLUDED.active,
          external_stats = EXCLUDED.external_stats,
          updated_at     = extract(epoch from now())::bigint
      `, [
        agentId, ACP_NETWORK, ACP_SOURCE, name, desc, imageUri,
        wallet, owner, services, true,
        registeredAt, JSON.stringify(externalStats),
      ])
      upserted++
    } catch (err) {
      console.error(`[ACP] Failed to upsert agent ${agent.id} (${name}):`, err)
    }
  }

  console.log(`[ACP] Sync complete. Upserted: ${upserted}/${agents.length}`)
  return { upserted, total: agents.length }
}

// Run directly: bun run src/services/indexer-acp.ts
if (import.meta.main) {
  syncAcpAgents()
    .then(r => { console.log('Done:', r); process.exit(0) })
    .catch(e => { console.error(e); process.exit(1) })
}
