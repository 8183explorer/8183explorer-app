/**
 * Brutalist loading spinner matching the 8183Explorer design system.
 */
export function LoadingSpinner({ size = 'md', message = 'Loading...' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div
        className={`${sizes[size]} border-4 border-black border-t-yellow-500 animate-spin`}
        role="status"
        aria-label={message}
      />
      {message && (
        <p className="font-mono text-sm font-bold uppercase tracking-widest text-black/70">
          {message}
        </p>
      )}
    </div>
  )
}
