import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: stylesCount },
    { count: suppliersCount },
    { count: activeCount },
    { count: conceptsCount },
  ] = await Promise.all([
    supabase.from('styles').select('*', { count: 'exact', head: true }),
    supabase.from('suppliers').select('*', { count: 'exact', head: true }),
    supabase.from('styles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('concepts').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="border border-neutral-800 rounded-lg p-6">
          <div className="text-4xl font-bold mb-2">{stylesCount || 0}</div>
          <div className="text-neutral-400">Total Styles</div>
        </div>
        <div className="border border-neutral-800 rounded-lg p-6">
          <div className="text-4xl font-bold mb-2">{activeCount || 0}</div>
          <div className="text-neutral-400">Active Styles</div>
        </div>
        <div className="border border-neutral-800 rounded-lg p-6">
          <div className="text-4xl font-bold mb-2">{conceptsCount || 0}</div>
          <div className="text-neutral-400">Concepts</div>
        </div>
        <div className="border border-neutral-800 rounded-lg p-6">
          <div className="text-4xl font-bold mb-2">{suppliersCount || 0}</div>
          <div className="text-neutral-400">Suppliers</div>
        </div>
      </div>
    </div>
  )
}
