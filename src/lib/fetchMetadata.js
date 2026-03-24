const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://dweb.link/ipfs/',
]

const FETCH_TIMEOUT = 10000  // 10 seconds

/**
 * Fetch and parse metadata from URI
 * Handles: ipfs://, https://, data:application/json;base64,
 */
export async function fetchMetadataFromURI(uri) {
  if (!uri) return null
  
  try {
    // ─────────────────────────────────────────────────────────
    // Handle base64 data URI
    // ─────────────────────────────────────────────────────────
    if (uri.startsWith('data:application/json;base64,')) {
      const base64 = uri.replace('data:application/json;base64,', '')
      const json = atob(base64)
      return JSON.parse(json)
    }
    
    // ─────────────────────────────────────────────────────────
    // Handle IPFS URI - try multiple gateways
    // ─────────────────────────────────────────────────────────
    if (uri.startsWith('ipfs://')) {
      const cid = uri.replace('ipfs://', '')
      
      for (const gateway of IPFS_GATEWAYS) {
        try {
          const response = await fetch(`${gateway}${cid}`, {
            signal: AbortSignal.timeout(FETCH_TIMEOUT),
            headers: { 'Accept': 'application/json' },
          })
          
          if (response.ok) {
            return await response.json()
          }
        } catch (err) {
          console.warn(`[8183Explorer] Gateway ${gateway} failed:`, err.message)
          continue
        }
      }
      
      console.error(`[8183Explorer] All IPFS gateways failed for ${cid}`)
      return null
    }
    
    // ─────────────────────────────────────────────────────────
    // Handle HTTPS/HTTP URI
    // ─────────────────────────────────────────────────────────
    if (uri.startsWith('https://') || uri.startsWith('http://')) {
      const response = await fetch(uri, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
        headers: { 'Accept': 'application/json' },
      })
      
      if (response.ok) {
        return await response.json()
      }
      
      console.error(`[8183Explorer] HTTP fetch failed: ${response.status}`)
      return null
    }
    
    console.warn(`[8183Explorer] Unknown URI scheme: ${uri.substring(0, 20)}...`)
    return null
    
  } catch (error) {
    console.error(`[8183Explorer] Failed to fetch metadata:`, error)
    return null
  }
}

/**
 * Extract categories/services from metadata
 */
export function extractCategories(metadata) {
  if (!metadata?.services) return []
  
  return metadata.services
    .map(s => s.name)
    .filter(Boolean)
}

/**
 * Resolve image URI (handle IPFS)
 */
export function resolveImageURI(uri) {
  if (!uri) return null
  
  if (uri.startsWith('ipfs://')) {
    const cid = uri.replace('ipfs://', '')
    return `https://ipfs.io/ipfs/${cid}`
  }
  
  return uri
}
