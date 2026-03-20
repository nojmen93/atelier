import { SkeletonCard } from '@/components/Skeleton'

export default function CatalogLoading() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-neutral-800 px-6 py-3">
        <div className="h-4 w-16 animate-pulse rounded bg-neutral-800" />
      </div>
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="h-5 w-24 animate-pulse rounded bg-neutral-800 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </main>
    </div>
  )
}
