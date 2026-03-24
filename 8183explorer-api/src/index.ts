import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { PORT, POLL_INTERVAL_MS, ENABLE_ERC8004_INDEXER } from './config.ts'
import { runIndexer, bootstrapAgents } from './services/indexer.ts'
import { bootstrapErc8004Agents, runErc8004Indexer } from './services/indexer-erc8004.ts'
import { syncAcpAgents } from './services/indexer-acp.ts'
import { startPriceFeed } from './services/price.ts'
import agentsRoute from './routes/agents.ts'
import searchRoute from './routes/search.ts'
import statsRoute  from './routes/stats.ts'

const app = new Hono()

app.use('*', logger())
app.use('*', cors({ origin: '*' }))

// Routes
app.route('/api/agents', agentsRoute)
app.route('/api/search', searchRoute)
app.route('/api',        statsRoute)
app.route('',            statsRoute)   // /health lives here

app.get('/', (c) => c.json({ name: '8183Explorer API', version: '1.0.0' }))

// Manual sync trigger (for dev/ops)
app.post('/api/admin/sync-acp', async (c) => {
  const result = await syncAcpAgents()
  return c.json(result)
})

// ── Start ─────────────────────────────────────────────────────────────────────

console.log('[8183explorer-api] Starting...')

// Live ETH price feed
startPriceFeed()

// Bootstrap Sepolia agents, then start event indexer
console.log(`[indexer] Starting sync (poll every ${POLL_INTERVAL_MS / 1000}s)`)
bootstrapAgents().then(() => {
  runIndexer()
  setInterval(runIndexer, POLL_INTERVAL_MS)
})

// Sync Virtuals ACP agents on startup, then every 30 minutes
console.log('[indexer-acp] Starting Virtuals ACP sync...')
syncAcpAgents().catch(e => console.error('[indexer-acp] Startup sync failed:', e))
setInterval(() => syncAcpAgents().catch(e => console.error('[indexer-acp] Periodic sync failed:', e)), 30 * 60 * 1000)

// Bootstrap ERC-8004 Base Mainnet agents
if (ENABLE_ERC8004_INDEXER) {
  console.log('[indexer-erc8004] Starting ERC-8004 Base Mainnet indexer...')
  bootstrapErc8004Agents().then(() => {
    runErc8004Indexer()
    setInterval(runErc8004Indexer, POLL_INTERVAL_MS)
  })
}

export default {
  port: PORT,
  fetch: app.fetch,
}

console.log(`[8183explorer-api] Listening on http://localhost:${PORT}`)
