import { SkeletonBlock, SkeletonRow } from '@/components/Skeleton'

export default function OrderDetailLoading() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-neutral-800 px-6 py-3">
        <div className="h-4 w-16 animate-pulse rounded bg-neutral-800" />
      </div>
      <main className="max-w-4xl mx-auto px-6 py-10">
        <SkeletonBlock className="h-3 w-28" />

        <div className="mt-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <SkeletonBlock className="h-5 w-32" />
            <SkeletonBlock className="h-3 w-40" />
          </div>
          <SkeletonBlock className="h-5 w-20 rounded-full" />
        </div>

        <div className="mb-8 pb-6 border-b border-neutral-800 space-y-2">
          <SkeletonBlock className="h-2.5 w-10" />
          <SkeletonBlock className="h-3 w-28" />
          <SkeletonBlock className="h-3 w-36" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800">
                {['Style', 'Color', 'Size', 'SKU', 'Qty', 'Price', 'Total'].map((h) => (
                  <th key={h} className="text-left py-3 pr-4">
                    <div className="h-2.5 w-10 animate-pulse rounded bg-neutral-800" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonRow key={i} cols={7} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end border-t border-neutral-800 pt-4 mt-0">
          <div className="space-y-2">
            <SkeletonBlock className="h-2.5 w-16" />
            <SkeletonBlock className="h-5 w-20" />
          </div>
        </div>
      </main>
    </div>
  )
}
