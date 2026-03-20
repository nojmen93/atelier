'use client'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl font-semibold text-neutral-700">Error</p>
        <h1 className="mt-4 text-lg font-medium text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-neutral-500">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="mt-6 px-6 py-2 rounded-md bg-foreground text-background text-sm font-medium hover:bg-neutral-200 transition"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
