import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes cached
      gcTime: 30 * 60 * 1000,         // 30 minutes in memory
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

export function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
