export function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-neutral-800 ${className}`} />
  )
}

export function SkeletonCard() {
  return (
    <div>
      <div className="aspect-[4/5] animate-pulse rounded-md bg-neutral-800" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-3/4 animate-pulse rounded bg-neutral-800" />
        <div className="h-2.5 w-1/2 animate-pulse rounded bg-neutral-800" />
      </div>
    </div>
  )
}

export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-neutral-800/50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3 pr-4">
          <div className="h-3 w-16 animate-pulse rounded bg-neutral-800" />
        </td>
      ))}
    </tr>
  )
}
