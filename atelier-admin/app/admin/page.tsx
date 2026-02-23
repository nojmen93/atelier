import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: productsCount },
    { count: suppliersCount },
    { count: publishedCount }
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('suppliers').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('published', true)
  ])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-neutral-800 rounded-lg p-6">
          <div className="text-4xl font-bold mb-2">{productsCount || 0}</div>
          <div className="text-neutral-400">Total Products</div>
        </div>
        <div className="border border-neutral-800 rounded-lg p-6">
          <div className="text-4xl font-bold mb-2">{publishedCount || 0}</div>
          <div className="text-neutral-400">Published Products</div>
        </div>
        <div className="border border-neutral-800 rounded-lg p-6">
          <div className="text-4xl font-bold mb-2">{suppliersCount || 0}</div>
          <div className="text-neutral-400">Suppliers</div>
        </div>
      </div>
    </div>
  )
}
