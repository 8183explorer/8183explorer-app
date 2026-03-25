# 8183Explorer — Agent Skills File

> **Project:** `8183Explorer` (brand: TrustRadar)
> **Repo Root:** `/Users/rhystalgie/Project/Web3/Deploy/8183Explorer`
> **Symlink:** `/Users/rhystalgie/Project/Web3/Deploy/TrustRadar` → points to the above
> **Version:** 1.0.0 · **Date:** 2026-03-26
> **Chain:** Base Sepolia (testnet) + Base Mainnet (read-only ERC-8004 indexing)
> **Standards:** ERC-8004 (Agent Identity), ERC-8183 (Agentic Commerce)

---

## How to Run Locally

```bash
# 1. Start Postgres
docker start trustradar-pg          # container must already exist

# 2. Start API (Bun + Hono)
cd /Users/rhystalgie/Project/Web3/Deploy/8183Explorer/8183explorer-api
bun run start                        # listens on port 3001

# 3. Start Frontend (Vite + React)
cd /Users/rhystalgie/Project/Web3/Deploy/8183Explorer
npm run dev                          # listens on port 5173
```

**Env:** `.env.local` at repo root
```
VITE_API_URL=http://localhost:3001
```

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Vite 5, React 19, TanStack Query v5, react-router-dom v7, viem v2, Tailwind 3 (brutalist) |
| Backend API | Bun + Hono 4, PostgreSQL (pg) |
| Contracts | Foundry, Base Sepolia chain 84532 |
| Style | Font: Inter + Space Mono. Colors: concrete bg, yellow (#FFD600), danger red, safe green |

---

## Repo Structure

```
8183Explorer/
├── src/
│   ├── App.jsx                  # Router (12 routes)
│   ├── pages/HomePage.jsx       # Landing page
│   ├── components/              # All other pages + shared components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── DatabasePage.jsx     # /database — agent table with pagination
│   │   ├── AgentDetailPage.jsx  # /agent/:uid — single agent profile
│   │   ├── AuditReportPage.jsx  # /agent/:uid/audit — formal audit report
│   │   ├── SearchResultsPage.jsx # /search — sidebar filters + grid/list
│   │   ├── MonitoredEntities.jsx # Homepage live agent grid (top 4)
│   │   ├── HeroSection.jsx      # Homepage hero with search bar + stats
│   │   └── AgentCard.jsx        # Reusable card component
│   ├── hooks/
│   │   ├── useAgents.js         # Paginated agent list → /api/search
│   │   ├── useAgent.js          # Single agent + jobs → /api/agents/:id
│   │   └── useAuditReport.js    # Audit report → /api/agents/:id/audit
│   ├── lib/
│   │   ├── api.js               # apiFetch(), normalizers, PENALTY_MAP
│   │   └── trustScore.js        # Client-side score helpers (unused in prod)
│   └── providers/QueryProvider.jsx  # React Query: 5m stale, 30m cache, 2 retries
│
└── 8183explorer-api/src/
    ├── index.ts                 # Hono app setup + CORS
    ├── config.ts                # Contract addresses, ABIs, viem clients
    ├── routes/
    │   ├── agents.ts            # /api/agents/:id  /jobs  /reputation  /audit
    │   ├── search.ts            # /api/search
    │   └── stats.ts             # /api/stats  /api/stats/breakdown  /health
    ├── services/
    │   ├── indexer.ts           # ERC-8183 event indexer (Base Sepolia, polls 12s)
    │   ├── indexer-erc8004.ts   # ERC-8004 identity indexer (Base Mainnet, optional)
    │   ├── indexer-acp.ts       # Virtuals ACP agent sync (~550 agents, every 30m)
    │   ├── scorer.ts            # TrustScore calculation engine
    │   └── price.ts             # Live ETH/USD price (updates every 60s)
    └── db/
        ├── schema.sql           # agents, jobs, feedback, indexer_state tables
        └── client.ts            # PostgreSQL pool
```

---

## API Reference

**Base URL:** `http://localhost:3001`
All routes return JSON. Errors: `{ error: string }` with 4xx/5xx status.

---

### GET /api/search

Main listing endpoint. Used by `useAgents()` hook for DatabasePage, SearchResultsPage, and MonitoredEntities.

**Query params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `q` | string | `""` | Search by name or description (case-insensitive) |
| `category` | string | `""` | Filter to agents where this string is in their categories array |
| `minScore` | number | `0` | Minimum trustScore (0–100) |
| `sort` | string | `"score"` | `score` \| `jobs` \| `volume` \| `recent` \| `name` |
| `page` | number | `1` | Page number |
| `limit` | number | `20` | Max 100 per page |

**Response shape:**
```json
{
  "query": { "q": "", "category": "", "minScore": 0, "sort": "score", "page": 1, "limit": 20 },
  "data": [
    {
      "uid": 1,
      "agentId": "1",
      "network": "base_sepolia",
      "source": "local",
      "name": "NEXUS_ORACLE_V3",
      "description": "...",
      "imageUri": null,
      "categories": ["DeFi", "Oracle"],
      "walletAddress": "0x0f8316...",
      "active": true,
      "services": [],
      "trustScore": 62,
      "badges": ["VERIFIED"],
      "redFlags": [],
      "stats": {
        "totalJobs": 5,
        "completedJobs": 5,
        "rejectedJobs": 0,
        "expiredJobs": 0,
        "successRate": 100,
        "totalVolumeUsd": 1250.00,
        "daysActive": 45,
        "uniqueClients": 3,
        "highValueJobCount": 0
      },
      "hireUrl": null
    }
  ],
  "meta": { "total": 556, "page": 1, "limit": 20, "pages": 28 }
}
```

> **Note:** For Virtuals ACP agents, `hireUrl` is `https://app.virtuals.io/acp/{documentId}`. For on-chain agents, it's `null`.

---

### GET /api/agents/:id

Single agent detail. `:id` is the serial **uid** (integer), NOT the on-chain agentId.

**Response shape:**
```json
{
  "uid": 1,
  "agentId": "1",
  "network": "base_sepolia",
  "source": "local",
  "name": "NEXUS_ORACLE_V3",
  "description": "...",
  "imageUri": null,
  "categories": ["DeFi"],
  "walletAddress": "0x0f8316...",
  "uri": "ipfs://Qm...",
  "registeredAt": "1710000000",
  "active": true,
  "services": [],
  "trustScore": 62,
  "badges": ["VERIFIED"],
  "redFlags": [],
  "scoreBreakdown": {
    "jobScore": 20,
    "successScore": 25,
    "volumeScore": 10,
    "ageScore": 7,
    "bonusScore": 0,
    "penalties": 0,
    "bonusBreakdown": {
      "repeatClients": 0,
      "clientDiversity": 0,
      "highValueJobs": 0
    }
  },
  "stats": {
    "totalJobs": 5,
    "completedJobs": 5,
    "rejectedJobs": 0,
    "expiredJobs": 0,
    "successRate": 100,
    "totalVolumeUsd": 1250.00,
    "daysActive": 45,
    "uniqueClients": 3
  },
  "reputationSummary": { "count": 2, "averageScore": 4.5 }
}
```

---

### GET /api/agents/:id/jobs

Job history for an agent.

**Query params:** `page` (default 1), `limit` (default 20)

**Response shape:**
```json
{
  "data": [
    {
      "job_id": "1",
      "client_address": "0xabc...",
      "provider_address": "0x0f8316...",
      "evaluator_address": "0xdef...",
      "description": "Analyze DeFi yield...",
      "budget_wei": "1000000000000000",
      "budget_usd": "2.50",
      "status": 3,
      "created_at": "1710000000",
      "completed_at": "1710003600",
      "expired_at": null
    }
  ],
  "meta": { "total": 5, "page": 1, "limit": 20 }
}
```

**Status codes:** 0=Open, 1=Funded, 2=Submitted, 3=Completed, 4=Rejected, 5=Expired

---

### GET /api/agents/:id/audit

Full audit report. Used by `useAuditReport()` hook.

**Response shape:**
```json
{
  "agent": {
    "agentId": "1",
    "name": "NEXUS_ORACLE_V3",
    "walletAddress": "0x0f8316...",
    "uri": "ipfs://Qm...",
    "registeredAt": "1710000000",
    "network": "base_sepolia",
    "source": "local"
  },
  "generatedAt": "2026-03-26T00:00:00.000Z",
  "trustScore": 62,
  "riskLevel": "LOW",
  "scoreBreakdown": { "jobScore": 20, "successScore": 25, "volumeScore": 10, "ageScore": 7, "bonusScore": 0, "penalties": 0, "bonusBreakdown": {...} },
  "stats": { "totalJobs": 5, "completedJobs": 5, "rejectedJobs": 0, "successRate": 100, "totalVolumeUsd": 1250, "avgJobSizeUsd": 250, "daysActive": 45, "uniqueClients": 3, "highValueJobCount": 0 },
  "redFlags": [],
  "reputation": { "count": 2, "averageScore": 4.5, "uniqueClients": 2 }
}
```

---

### GET /api/stats

Global platform statistics. Used by DatabasePage header.

**Response shape:**
```json
{
  "totalAgents": 556,
  "totalJobs": 12043,
  "onChainJobs": 43,
  "acpJobs": 12000,
  "totalFeedback": 12,
  "jobsByStatus": { "3": 38, "4": 3, "5": 2 },
  "totalVolumeEth": "0.045000",
  "totalVolumeUsd": 45200.00,
  "acpVolumeUsd": 44000.00,
  "ethPriceUsd": 2800
}
```

---

### GET /api/stats/breakdown

Category and network distribution. Used by DatabasePage sidebar stats.

**Response shape:**
```json
{
  "networkBreakdown": [
    { "network": "base_mainnet", "count": 550, "pct": 98.9 },
    { "network": "base_sepolia", "count": 6, "pct": 1.1 }
  ],
  "categoryBreakdown": [
    { "name": "GameFi", "count": 120, "pct": 21.6 },
    { "name": "DeFi",   "count": 98,  "pct": 17.6 },
    { "name": "Social", "count": 80,  "pct": 14.4 }
  ]
}
```

---

### GET /health

Indexer and database health check.

```json
{
  "status": "ok",
  "lastIndexedBlock": "19847234",
  "chainBlock": "19847240",
  "blockLag": "6",
  "db": "ok",
  "rpc": "ok",
  "price": { "ethPriceUsd": 2800, "updatedAt": "2026-03-26T00:00:00.000Z" },
  "timestamp": "2026-03-26T00:01:00.000Z"
}
```

---

## Frontend Data Flow

```
Page → Hook → apiFetch() → API → normalizer → Component
```

| Hook | Endpoint | Normalizer | Used By |
|------|----------|------------|---------|
| `useAgents(filters)` | `GET /api/search` | `normalizeAgentSummary` | DatabasePage, SearchResultsPage, MonitoredEntities |
| `useAgent(uid)` | `GET /api/agents/:uid` + `GET /api/agents/:uid/jobs` | `normalizeAgentDetail` + `normalizeJob` | AgentDetailPage |
| `useAuditReport(uid)` | `GET /api/agents/:uid/audit` | `normalizeAuditReport` | AuditReportPage |
| (inline `useQuery`) | `GET /api/stats` | — (raw) | DatabasePage, HeroSection |
| (inline `useQuery`) | `GET /api/stats/breakdown` | — (raw) | DatabasePage |

---

## Normalized Data Shapes (what components receive)

### `normalizeAgentSummary(a)` → used in lists/grids

```js
{
  uid,          // serial DB id — USE THIS for /agent/:uid routing
  agentId,      // on-chain agent_id (string) — do NOT use for routing
  network,      // 'base_sepolia' | 'base_mainnet'
  source,       // 'local' | 'erc8004' | 'virtuals_acp'
  name, description, imageUri,
  categories,   // string[]
  wallet,       // walletAddress
  services,     // string[]
  active,       // boolean
  trustScore,   // 0–100 integer
  badges,       // string[] e.g. ['VERIFIED', 'TOP_RATED', 'WARNING']
  redFlags,     // string[] e.g. ['SYBIL_PATTERN', 'HIGH_REJECT_RATE']
  stats,        // { totalJobs, completedJobs, rejectedJobs, expiredJobs, successRate(0-100), totalVolumeUsd, daysActive, uniqueClients }
  totalJobs,    // alias for stats.totalJobs
  successRate,  // 0–1 float (stats.successRate / 100)
  totalVolume,  // string of USD amount
}
```

### `normalizeAgentDetail(a)` → used in AgentDetailPage

```js
{
  uid, agentId, network, source,
  name, description, imageUri,
  categories, wallet, walletFull, services, active, uri,
  trustScore: {
    totalScore,     // 0–100
    badges,         // string[]
    redFlags,       // [{ flag, penalty }]
    daysActive,
    jobScore, successScore, volumeScore, ageScore, bonusScore,
  },
  jobStats: {
    totalJobs, completedJobs, rejectedJobs, expiredJobs,
    successRate,    // 0–1 float
    totalVolumeUsd, // string
    avgJobSizeUsd,  // string
    uniqueClients,
    jobs: [normalizeJob(...)],  // populated via /jobs endpoint
  },
  reputation: { count, averageScore },
}
```

### `normalizeJob(j)` → individual job rows

```js
{
  jobId, client, provider, evaluator, description,
  budget,       // BigInt (wei)
  budgetEth,    // string e.g. "0.001000"
  budgetUsd,    // string e.g. "$2.50"
  status,       // number 0–5
  statusName,   // 'Open'|'Funded'|'Submitted'|'Completed'|'Rejected'|'Expired'
  createdAt, completedAt, expiredAt,  // Date | null
}
```

---

## Routing Rules

**CRITICAL:** Always route to `/agent/${uid}` (serial DB id), NOT `agentId` (on-chain string).

```js
// ✅ CORRECT
navigate(`/agent/${agent.uid}`)

// ❌ WRONG — agentId is the on-chain registry ID, not the DB uid
navigate(`/agent/${agent.agentId}`)
```

The URL param `agentId` in react-router is misleading — it actually holds the `uid` value.

---

## TrustScore Formula

```
TrustScore = jobScore(max 30) + successScore(max 25) + volumeScore(max 20) + ageScore(max 15) + bonusScore(max 10) - penalties
```

**Red Flag Penalties (`PENALTY_MAP`):**

| Flag | Penalty |
|------|---------|
| `SYBIL_PATTERN` | −50 |
| `WASH_TRADING` | −30 |
| `HIGH_REJECT_RATE` | −20 |
| `HIGH_EXPIRED_RATE` | −15 |
| `INACTIVE` | −10 |

**Badges:** `VERIFIED` (score ≥ 80), `TOP_RATED` (score ≥ 90), `NEW` (< 7 days), `WARNING` (has redFlags)

---

## Deployed Contracts

### Base Sepolia (testnet — active jobs/scoring)

| Contract | Address |
|----------|---------|
| `AgentRegistry` | `0x03bF6389eE5884884b1459877d3e9576492Eb1E1` |
| `ReputationRegistry` | `0x552C798370A1B1C9e0988B9B30103e2da058e7Ba` |
| `AgenticCommerce` | `0x5D8e20e2247d38e0A64B78Bc7B6f2Fe06CEBE0B7` |

### Base Mainnet (read-only ERC-8004 identity indexing)

| Contract | Address |
|----------|---------|
| `IdentityRegistry` | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` |
| `ReputationRegistry` | `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63` |

> ~550 real mainnet agents indexed. Shown with `network: 'base_mainnet'` in DB.

---

## Seeded Demo Agents (Base Sepolia, uid 1–5)

| uid | Name | Score | Notes |
|-----|------|-------|-------|
| 1 | `NEXUS_ORACLE_V3` | ~62 | 5 completed jobs, clean |
| 2 | `AURA_YIELD_BOT` | ~28 | 3 completed + 1 rejected |
| 3 | `CONTENT_ENGINE_X` | ~35 | 3 completed, clean |
| 4 | `TRADE_SIGNAL_PRO` | 0 | 0 jobs, new agent |
| 5 | `RISKY_TRADER_BOT` | 0 | `SYBIL_PATTERN` flag, score clamped |

---

## Key Business Rules

- **All data from API** — NO direct RPC calls from frontend ever
- **`budgetUsd`** comes from backend (ETH × live price), never computed in frontend
- **HIRE links** → Virtuals ACP: `https://app.virtuals.io/acp/scan/agents` (do not change)
- **Virtuals ACP agents** (source=`virtuals_acp`) use `external_stats` from Virtuals API, not on-chain jobs
- **Mainnet agents** (network=`base_mainnet`) have identity but no job history on testnet contracts
- **Score 0** can mean: new agent (no jobs) OR flagged (SYBIL_PATTERN). Check `redFlags` to distinguish.

---

## Known Issues (2026-03-26)

| # | Issue | File | Status |
|---|-------|------|--------|
| 1 | HeroSection stats are hardcoded (556/142/$45.2M) — should fetch `/api/stats` | `HeroSection.jsx` | TODO |
| 2 | HeroSection search bar doesn't pass query on navigate | `HeroSection.jsx` | TODO |
| 3 | SearchResultsPage category list hardcoded (DeFi/Content/Trading/Code) — fetch from `/api/stats/breakdown` | `SearchResultsPage.jsx` | TODO |
| 4 | SearchResultsPage pagination hardcoded (total=12, pages=[1,2,3]) — use real `data.total` | `SearchResultsPage.jsx` | TODO |
| 5 | SearchResultsPage AgentCard VIEW/HIRE buttons have no onClick | `SearchResultsPage.jsx` | TODO |
| 6 | SearchResultsPage NEWEST sort maps to 'score' — should be 'recent' | `SearchResultsPage.jsx` | TODO |
| 7 | DatabasePage MAINNET badge missing from table rows | `DatabasePage.jsx` | TODO |
| 8 | AgentDetailPage no network badge + activeSince is hardcoded | `AgentDetailPage.jsx` | TODO |
| 9 | MonitoredEntities uses agentId instead of uid for navigation | `MonitoredEntities.jsx` | TODO |
| 10 | Backend CORS is `*` — needs origin restriction for prod | `api/index.ts` | PROD |
| 11 | No rate limiting on API | `api/index.ts` | PROD |

---

## Integration Checklist (before making changes)

- [ ] Backend running: `docker start trustradar-pg && cd 8183explorer-api && bun run start`
- [ ] Frontend running: `npm run dev` from repo root
- [ ] Never call RPC directly from frontend — always go through API
- [ ] Use `uid` (not `agentId`) for routing and API calls
- [ ] `budgetUsd` comes from backend, not computed frontend-side
- [ ] HIRE links point to Virtuals ACP — do not change
- [ ] `successRate` from `normalizeAgentSummary` is 0–1 (divide by 100 before %)
- [ ] `successRate` from raw API stats is 0–100 (already a percent)

---

*Machine-readable onboarding file for AI agents working on 8183Explorer.*
*Human docs: `/memory/project_status.md`*
