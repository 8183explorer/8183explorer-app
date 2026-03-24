/**
 * Brutalist error state with retry button.
 */
export function ErrorState({ error, onRetry, title = 'Error Loading Data' }) {
  return (
    <div className="mx-auto my-12 max-w-xl border-4 border-black bg-red-50 p-8 shadow-brutal text-center">
      <p className="font-mono text-xl font-bold uppercase tracking-widest text-red-700">
        {title}
      </p>
      <p className="mt-3 font-mono text-sm text-red-600">
        {error?.message || 'An unexpected error occurred.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 border-2 border-black bg-yellow-400 px-6 py-2 font-mono font-bold uppercase shadow-brutal-sm hover:bg-yellow-300 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          Retry
        </button>
      )}
    </div>
  )
}
