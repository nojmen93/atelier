import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: stylesCount },
    { count: suppliersCount },
    { count: activeCount },
    { count: conceptsCount },
    { count: pendingQuotes },
    { count: totalQuotes },
    { count: acceptedQuotes },
    { count: quotedQuotes },
    { data: recentQuotes },
  ] = await Promise.all([
    supabase.from('styles').select('*', { count: 'exact', head: true }),
    supabase.from('suppliers').select('*', { count: 'exact', head: true }),
    supabase.from('styles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('concepts').select('*', { count: 'exact', head: true }),
    supabase.from('quote_requests').select('*', { count: 'exact', head: true }).in('status', ['new', 'reviewed']),
    supabase.from('quote_requests').select('*', { count: 'exact', head: true }),
    supabase.from('quote_requests').select('*', { count: 'exact', head: true }).in('status', ['accepted', 'converted']),
    supabase.from('quote_requests').select('*', { count: 'exact', head: true }).in('status', ['quoted', 'accepted', 'converted']),
    supabase.from('quote_requests').select('id, customer_name, customer_company, product_name, status, quantity, created_at, styles(name)').order('created_at', { ascending: false }).limit(5),
  ])

  const conversionRate = (quotedQuotes || 0) > 0
    ? Math.round(((acceptedQuotes || 0) / (quotedQuotes || 0)) * 100)
    : 0

  const STATUS_BADGES: Record<string, string> = {
    new: 'bg-blue-900/50 border-blue-700 text-blue-200',
    reviewed: 'bg-yellow-900/50 border-yellow-700 text-yellow-200',
    quoted: 'bg-purple-900/50 border-purple-700 text-purple-200',
    accepted: 'bg-green-900/50 border-green-700 text-green-200',
    rejected: 'bg-red-900/50 border-red-700 text-red-200',
    converted: 'bg-emerald-900/50 border-emerald-700 text-emerald-200',
  }

  const STATUS_LABELS: Record<string, string> = {
    new: 'New', reviewed: 'Reviewed', quoted: 'Quoted',
    accepted: 'Accepted', rejected: 'Rejected', converted: 'Converted',
  }

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

      {/* Quote Metrics */}
      <h2 className="text-xl font-semibold mt-12 mb-6">Quote Requests</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Link href="/admin/quotes" className="border border-blue-900/50 rounded-lg p-6 hover:border-blue-700 transition">
          <div className="text-4xl font-bold mb-2 text-blue-300">{pendingQuotes || 0}</div>
          <div className="text-neutral-400">Pending Review</div>
        </Link>
        <div className="border border-neutral-800 rounded-lg p-6">
          <div className="text-4xl font-bold mb-2">{totalQuotes || 0}</div>
          <div className="text-neutral-400">Total Quotes</div>
        </div>
        <div className="border border-neutral-800 rounded-lg p-6">
          <div className="text-4xl font-bold mb-2 text-green-300">{acceptedQuotes || 0}</div>
          <div className="text-neutral-400">Accepted/Converted</div>
        </div>
        <div className="border border-neutral-800 rounded-lg p-6">
          <div className="text-4xl font-bold mb-2">{conversionRate}%</div>
          <div className="text-neutral-400">Conversion Rate</div>
        </div>
      </div>

      {/* Recent Quotes */}
      {recentQuotes && recentQuotes.length > 0 && (
        <div className="border border-neutral-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-400">Recent Quotes</h3>
            <Link href="/admin/quotes" className="text-xs text-neutral-500 hover:text-white transition">View all &rarr;</Link>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {recentQuotes.map((q: Record<string, unknown>) => (
                <tr key={q.id as string} className="border-b border-neutral-800 last:border-b-0 hover:bg-neutral-900/50">
                  <td className="px-4 py-3 text-neutral-400 text-xs tabular-nums">
                    {new Date(q.created_at as string).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </td>
                  <td className="px-4 py-3 font-medium">{q.customer_name as string}</td>
                  <td className="px-4 py-3 text-neutral-400">{q.customer_company as string || '—'}</td>
                  <td className="px-4 py-3 text-neutral-300">
                    {(q.styles as Record<string, string> | null)?.name || (q.product_name as string) || '—'}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-400">{q.quantity as number}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded border ${STATUS_BADGES[q.status as string] || ''}`}>
                      {STATUS_LABELS[q.status as string] || String(q.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/quotes/${q.id}`} className="text-xs text-neutral-500 hover:text-white transition">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
