/**
 * ETH/USD price feed — fetches from CoinGecko every 5 minutes.
 * Falls back to ETH_PRICE_USD env var if the API is down.
 */

const FALLBACK_PRICE = Number(process.env.ETH_PRICE_USD ?? 3_500)
const REFRESH_INTERVAL_MS = 5 * 60 * 1_000  // 5 minutes

let cachedPrice: number = FALLBACK_PRICE
let lastFetchedAt: number = 0

export function getEthPriceUsd(): number {
  return cachedPrice
}

async function fetchPrice(): Promise<void> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      { signal: AbortSignal.timeout(5_000) }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json() as { ethereum?: { usd?: number } }
    const price = data?.ethereum?.usd
    if (typeof price === 'number' && price > 0) {
      cachedPrice = price
      lastFetchedAt = Date.now()
      console.log(`[price] ETH/USD updated: $${price}`)
    }
  } catch (err) {
    console.warn(`[price] Fetch failed, keeping $${cachedPrice}:`, (err as Error).message)
  }
}

export function startPriceFeed(): void {
  // Fetch immediately on start, then every 5 minutes
  fetchPrice()
  setInterval(fetchPrice, REFRESH_INTERVAL_MS)
}

export function getPriceMeta() {
  return {
    ethPriceUsd: cachedPrice,
    lastFetchedAt: lastFetchedAt ? new Date(lastFetchedAt).toISOString() : null,
    source: 'coingecko',
  }
}
