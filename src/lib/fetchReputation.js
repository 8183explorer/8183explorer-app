import { parseAbi } from 'viem'
import { ethClient, getActiveAddresses, ENV, REPUTATION_ABI } from '../config/contracts'
import { getMockReputation } from './mockData'

/**
 * Fetch reputation data for an agent from ERC-8004 ReputationRegistry.
 */
export async function fetchAgentReputation(agentId) {
  if (ENV.useERC8004Mock) {
    return getMockReputation(agentId)
  }

  const addresses = getActiveAddresses()
  const abi = parseAbi(REPUTATION_ABI)
  const id = BigInt(agentId)

  try {
    // Step 1: Get all clients who have given feedback for this agent
    const clients = await ethClient.readContract({
      address: addresses.reputationRegistry,
      abi,
      functionName: 'getClients',
      args: [id],
    })

    console.log(`[8183Explorer] Agent ${agentId} has ${clients.length} unique feedback clients`)

    if (!clients || clients.length === 0) {
      return {
        count:         0,
        averageScore:  0,
        uniqueClients: 0,
        feedback:      [],
      }
    }

    // Step 2: Get summary — pass the known client addresses, no tag filter
    const summary = await ethClient.readContract({
      address: addresses.reputationRegistry,
      abi,
      functionName: 'getSummary',
      args: [id, clients, '', ''],
    })

    // summary is a named tuple: { count, summaryValue, summaryValueDecimals }
    // or positional array — handle both
    const count     = summary.count     ?? summary[0]
    const sumVal    = summary.summaryValue ?? summary[1]
    const decimals  = summary.summaryValueDecimals ?? summary[2]

    // Average score normalized to a 0–100 scale (value uses 2 fixed decimals per contract)
    const averageScore = Number(count) > 0
      ? Number(sumVal) / Number(count) / Math.pow(10, Number(decimals))
      : 0

    console.log(`[8183Explorer] Agent ${agentId} reputation: count=${count}, avg=${averageScore}`)

    // Step 3: Get full feedback list (no client filter, no tag filter, exclude revoked)
    const feedbackData = await ethClient.readContract({
      address: addresses.reputationRegistry,
      abi,
      functionName: 'readAllFeedback',
      args: [id, [], '', '', false],
    })

    // handles both named-field and positional-tuple returns from viem
    const feedbackClients   = feedbackData.clients       ?? feedbackData[0] ?? []
    const feedbackIndexes   = feedbackData.indexes       ?? feedbackData[1] ?? []
    const values            = feedbackData.values        ?? feedbackData[2] ?? []
    const valueDecimals     = feedbackData.valueDecimals ?? feedbackData[3] ?? []
    const tag1s             = feedbackData.tag1s         ?? feedbackData[4] ?? []
    const tag2s             = feedbackData.tag2s         ?? feedbackData[5] ?? []
    const revokedStatuses   = feedbackData.revokedStatuses ?? feedbackData[6] ?? []

    const feedback = feedbackClients.map((client, i) => ({
      client,
      index:     Number(feedbackIndexes[i]),
      value:     Number(values[i]) / Math.pow(10, Number(valueDecimals[i])),
      tag1:      tag1s[i]   || '',
      tag2:      tag2s[i]   || '',
      isRevoked: revokedStatuses[i],
    }))

    return {
      count:         Number(count),
      averageScore:  Math.round(averageScore * 100) / 100,
      uniqueClients: clients.length,
      feedback,
    }

  } catch (error) {
    console.error(`[8183Explorer] Failed to fetch reputation for agent ${agentId}:`, error)
    return getMockReputation(agentId)
  }
}
