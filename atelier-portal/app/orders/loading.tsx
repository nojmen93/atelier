import { SkeletonRow } from '@/components/Skeleton'

export default function OrdersLoading() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-neutral-800 px-6 py-3">
        <div className="h-4 w-16 animate-pulse rounded bg-neutral-800" />
      </div>
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="h-5 w-20 animate-pulse rounded bg-neutral-800 mb-8" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800">
                {['Order', 'Submitted', 'Items', 'Total', 'Status'].map((h) => (
                  <th key={h} className="text-left py-3 pr-4">
                    <div className="h-2.5 w-14 animate-pulse rounded bg-neutral-800" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonRow key={i} cols={5} />
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
