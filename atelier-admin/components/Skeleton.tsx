'use client'

export function SkeletonCard() {
  return (
    <div className="border border-neutral-800 rounded-lg overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-neutral-800" />
      <div className="p-6 space-y-3">
        <div className="h-5 bg-neutral-800 rounded w-3/4" />
        <div className="h-3 bg-neutral-800/60 rounded w-1/2" />
        <div className="h-3 bg-neutral-800/60 rounded w-2/3" />
        <div className="flex gap-2 mt-4">
          <div className="h-6 w-16 bg-neutral-800 rounded" />
          <div className="h-6 w-14 bg-neutral-800 rounded" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="border border-neutral-800 rounded-lg p-6 animate-pulse">
      <div className="h-5 bg-neutral-800 rounded w-1/3 mb-3" />
      <div className="grid grid-cols-4 gap-4">
        <div className="h-3 bg-neutral-800/60 rounded" />
        <div className="h-3 bg-neutral-800/60 rounded" />
        <div className="h-3 bg-neutral-800/60 rounded" />
        <div className="h-3 bg-neutral-800/60 rounded" />
      </div>
    </div>
  )
}

export function SkeletonLogoCard() {
  return (
    <div className="border border-neutral-800 rounded-lg overflow-hidden animate-pulse">
      <div className="aspect-square bg-neutral-800" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-neutral-800 rounded w-3/4" />
        <div className="h-3 bg-neutral-800/60 rounded w-1/3" />
      </div>
    </div>
  )
}

export function SkeletonMetric() {
  return (
    <div className="border border-neutral-800 rounded-lg p-6 animate-pulse">
      <div className="h-10 w-16 bg-neutral-800 rounded mb-2" />
      <div className="h-4 w-24 bg-neutral-800/60 rounded" />
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="border border-neutral-800 border-dashed rounded-lg p-16 text-center">
      <div className="mx-auto mb-5 text-neutral-600">{icon}</div>
      <h3 className="text-lg font-semibold text-neutral-300 mb-2">{title}</h3>
      <p className="text-neutral-500 text-sm mb-6 max-w-sm mx-auto">{description}</p>
      {action}
    </div>
  )
}
