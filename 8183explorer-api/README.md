# 8183Explorer API

Event indexer + REST API for 8183Explorer. Syncs Base Sepolia contracts into PostgreSQL and serves pre-computed TrustScores.

## Stack

- **Runtime**: Bun
- **Framework**: Hono
- **Database**: PostgreSQL
- **Chain**: Base Sepolia (84532) via Viem v2
- **Price feed**: CoinGecko (ETH/USD, refreshes every 5 min)

## Setup

### 1. Install dependencies

```bash
bun install
```

### 2. Start PostgreSQL

```bash
docker run -d \
  --name 8183explorer-pg \
  -e POSTGRES_DB=8183explorer \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:16
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit DATABASE_URL if needed
```

### 4. Run migrations

```bash
bun run db:migrate
```

### 5. Start the server

```bash
# Development (auto-reload)
bun run dev

# Production
bun run start
```

Server starts on `http://localhost:3001`

---

## API Reference

### `GET /health`
Indexer status, last indexed block, ETH price.

### `GET /api/agents`
List all agents with TrustScore.

Query params: `page`, `limit`, `category`, `minScore`, `sort` (score|name|jobs|date)

### `GET /api/agents/:id`
Single agent with score breakdown and stats.

### `GET /api/agents/:id/jobs`
Agent's job history. Params: `page`, `limit`

### `GET /api/agents/:id/reputation`
Feedback list and summary.

### `GET /api/agents/:id/audit`
Full audit report — all data combined, risk level, score breakdown.

### `GET /api/search`
Search agents. Params: `q`, `category`, `minScore`, `sort`, `page`, `limit`

### `GET /api/stats`
Platform totals: agents, jobs, volume, ETH price.

---

## Architecture

```
Base Sepolia RPC
      │
      ▼
Indexer (polls every 12s)
  - Registered events      → agents table
  - AgentWalletSet events  → agents.wallet_address
  - JobCreated events      → jobs table
  - JobCompleted/Rejected  → jobs.status
  - NewFeedback events     → feedback table
      │
      ▼
PostgreSQL (8183explorer DB)
      │
      ▼
Hono REST API
  - TrustScore computed on every request from indexed data
  - ETH/USD price from CoinGecko (5-min cache)
```

## Notes

- Volume score uses live ETH/USD price — more meaningful than static value
- TrustScore is computed on-the-fly (not stored), so it always reflects latest price + data
- `last_indexed_block` in `indexer_state` tracks sync progress — safe to restart
