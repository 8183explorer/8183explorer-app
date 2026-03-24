import { useQuery } from '@tanstack/react-query'
import { apiFetch, normalizeAuditReport } from '../lib/api'

export function useAuditReport(agentId, enabled = true) {
  return useQuery({
    queryKey: ['audit', String(agentId)],
    queryFn: async () => {
      const data = await apiFetch(`/api/agents/${agentId}/audit`)
      return normalizeAuditReport(data)
    },
    enabled: !!agentId && enabled,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })
}
