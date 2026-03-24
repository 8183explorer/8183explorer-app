import { useQuery } from '@tanstack/react-query'
import { apiFetch, normalizeAgentDetail, normalizeJob } from '../lib/api'

export function useAgent(agentId) {
  return useQuery({
    queryKey: ['agent', String(agentId)],
    queryFn: async () => {
      if (!agentId) return null

      const [agentData, jobsData] = await Promise.all([
        apiFetch(`/api/agents/${agentId}`),
        apiFetch(`/api/agents/${agentId}/jobs?limit=50`),
      ])

      const normalized = normalizeAgentDetail(agentData)
      normalized.jobStats.jobs = (jobsData.data ?? []).map(normalizeJob)

      return normalized
    },
    enabled: !!agentId,
    staleTime: 5 * 60 * 1000,
  })
}
