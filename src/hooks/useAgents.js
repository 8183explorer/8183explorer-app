import { useQuery } from '@tanstack/react-query'
import { apiFetch, normalizeAgentSummary } from '../lib/api'

export function useAgents(filters = {}) {
  const { query = '', category = '', minScore = 0, sort = 'score', page = 1, limit = 20 } = filters

  const params = new URLSearchParams()
  if (query)    params.set('q',        query)
  if (category) params.set('category', category)
  if (minScore) params.set('minScore', String(minScore))
  params.set('sort',  sort)
  params.set('page',  String(page))
  params.set('limit', String(limit))

  return useQuery({
    queryKey: ['agents', filters],
    queryFn: async () => {
      const data = await apiFetch(`/api/search?${params}`)
      return {
        agents: data.data.map(normalizeAgentSummary),
        total:  data.meta.total,
        pages:  data.meta.pages,
      }
    },
    staleTime: 2 * 60 * 1000,
  })
}
