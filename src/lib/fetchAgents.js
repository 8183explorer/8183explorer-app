import { parseAbi } from 'viem'
import { ethClient, getActiveAddresses, ENV, IDENTITY_ABI } from '../config/contracts'
import { fetchMetadataFromURI, extractCategories } from './fetchMetadata'
import { getMockAgents, getMockAgentById } from './mockData'

const BATCH_SIZE = 50  // Agents per multicall

/**
 * Fetch all registered agents from ERC-8004 Identity Registry
 * Uses multicall for efficient batching
 */
export async function fetchAllAgents() {
  // Check mock mode
  if (ENV.useERC8004Mock) {
    console.log('[8183Explorer] ERC-8004 not configured, using mock data')
    return getMockAgents()
  }
  
  const addresses = getActiveAddresses()
  const abi = parseAbi(IDENTITY_ABI)
  
  try {
    // Step 1: Get total supply
    const totalSupply = await ethClient.readContract({
      address: addresses.identityRegistry,
      abi,
      functionName: 'totalSupply',
    })
    
    const total = Number(totalSupply)
    console.log(`[8183Explorer] Found ${total} registered agents`)
    
    if (total === 0) return []
    
    // Step 2: Generate agent IDs (1-indexed for ERC-721)
    const agentIds = Array.from({ length: total }, (_, i) => BigInt(i + 1))
    
    // Step 3: Batch fetch with multicall
    const agents = []
    
    for (let i = 0; i < agentIds.length; i += BATCH_SIZE) {
      const batchIds = agentIds.slice(i, i + BATCH_SIZE)
      console.log(`[8183Explorer] Fetching batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(agentIds.length / BATCH_SIZE)}`)
      
      // Build multicall array (3 calls per agent)
      const calls = batchIds.flatMap(id => [
        {
          address: addresses.identityRegistry,
          abi,
          functionName: 'tokenURI',
          args: [id],
        },
        {
          address: addresses.identityRegistry,
          abi,
          functionName: 'ownerOf',
          args: [id],
        },
        {
          address: addresses.identityRegistry,
          abi,
          functionName: 'getAgentWallet',
          args: [id],
        },
      ])
      
      const results = await ethClient.multicall({ contracts: calls })
      
      // Process results (3 results per agent)
      for (let j = 0; j < batchIds.length; j++) {
        const agentId = batchIds[j]
        const baseIndex = j * 3
        
        const uriResult = results[baseIndex]
        const ownerResult = results[baseIndex + 1]
        const walletResult = results[baseIndex + 2]
        
        // Skip if any call failed
        if (uriResult.status === 'failure') {
          console.warn(`[8183Explorer] Failed to fetch URI for agent ${agentId}`)
          continue
        }
        
        agents.push({
          agentId,
          uri: uriResult.result,
          owner: ownerResult.result,
          wallet: walletResult.result || ownerResult.result,
          metadata: null,  // Fetched separately
          name: null,
          description: null,
          image: null,
          categories: [],
        })
      }
    }
    
    // Step 4: Fetch metadata in parallel (with concurrency limit)
    console.log(`[8183Explorer] Fetching metadata for ${agents.length} agents`)
    const METADATA_CONCURRENCY = 10
    
    for (let i = 0; i < agents.length; i += METADATA_CONCURRENCY) {
      const batch = agents.slice(i, i + METADATA_CONCURRENCY)
      
      const metadataResults = await Promise.allSettled(
        batch.map(agent => fetchMetadataFromURI(agent.uri))
      )
      
      metadataResults.forEach((result, j) => {
        const agentIndex = i + j
        
        if (result.status === 'fulfilled' && result.value) {
          const metadata = result.value
          agents[agentIndex].metadata = metadata
          agents[agentIndex].name = metadata.name || `Agent #${agents[agentIndex].agentId}`
          agents[agentIndex].description = metadata.description || ''
          agents[agentIndex].image = metadata.image || null
          agents[agentIndex].categories = extractCategories(metadata)
          agents[agentIndex].services = metadata.services || []
          agents[agentIndex].active = metadata.active ?? true
          agents[agentIndex].x402Support = metadata.x402Support ?? false
        } else {
          // Set defaults for failed metadata fetch
          agents[agentIndex].name = `Agent #${agents[agentIndex].agentId}`
          agents[agentIndex].description = ''
          agents[agentIndex].categories = []
        }
      })
    }
    
    console.log(`[8183Explorer] Successfully fetched ${agents.length} agents`)
    return agents
    
  } catch (error) {
    console.error('[8183Explorer] Failed to fetch agents:', error)
    
    // Fallback to mock data on error
    console.log('[8183Explorer] Falling back to mock data')
    return getMockAgents()
  }
}

/**
 * Fetch single agent by ID
 */
export async function fetchAgentById(agentId) {
  if (ENV.useERC8004Mock) {
    return getMockAgentById(agentId)
  }
  
  const addresses = getActiveAddresses()
  const abi = parseAbi(IDENTITY_ABI)
  const id = BigInt(agentId)
  
  try {
    const results = await ethClient.multicall({
      contracts: [
        { address: addresses.identityRegistry, abi, functionName: 'tokenURI', args: [id] },
        { address: addresses.identityRegistry, abi, functionName: 'ownerOf', args: [id] },
        { address: addresses.identityRegistry, abi, functionName: 'getAgentWallet', args: [id] },
      ],
    })
    
    const [uriResult, ownerResult, walletResult] = results
    
    if (uriResult.status === 'failure') {
      throw new Error(`Agent ${agentId} not found`)
    }
    
    const metadata = await fetchMetadataFromURI(uriResult.result)
    
    return {
      agentId: id,
      uri: uriResult.result,
      owner: ownerResult.result,
      wallet: walletResult.result || ownerResult.result,
      metadata,
      name: metadata?.name || `Agent #${agentId}`,
      description: metadata?.description || '',
      image: metadata?.image || null,
      categories: extractCategories(metadata),
      services: metadata?.services || [],
      active: metadata?.active ?? true,
      x402Support: metadata?.x402Support ?? false,
    }
    
  } catch (error) {
    console.error(`[8183Explorer] Failed to fetch agent ${agentId}:`, error)
    throw error
  }
}
