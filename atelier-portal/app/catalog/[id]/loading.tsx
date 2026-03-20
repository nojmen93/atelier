import { SkeletonBlock } from '@/components/Skeleton'

export default function StyleDetailLoading() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-neutral-800 px-6 py-3">
        <div className="h-4 w-16 animate-pulse rounded bg-neutral-800" />
      </div>
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="h-3 w-28 animate-pulse rounded bg-neutral-800" />
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="aspect-[4/5] animate-pulse rounded-md bg-neutral-800" />
          <div className="space-y-4 pt-2">
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="h-6 w-48" />
            <SkeletonBlock className="h-5 w-16 mt-3" />
            <SkeletonBlock className="h-16 w-full mt-4" />
            <div className="mt-8 space-y-3">
              <SkeletonBlock className="h-3 w-12" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonBlock key={i} className="h-6 w-6 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
