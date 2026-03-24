import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function formatAction(action: string) {
  return action.charAt(0).toUpperCase() + action.slice(1).replace(/_/g, ' ')
}

export default async function AuditPage() {
  const db = createAdminClient()
  const { data: rows } = await db
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  const entries = rows ?? []

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <p className="text-neutral-500 text-sm mt-1">Last 100 admin actions</p>
      </div>

      {entries.length === 0 ? (
        <div className="border border-neutral-800 border-dashed rounded-lg p-16 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-5 text-neutral-600">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <h3 className="text-lg font-semibold text-neutral-300 mb-2">No audit entries yet</h3>
          <p className="text-neutral-500 text-sm">Actions taken in the admin panel will be logged here.</p>
        </div>
      ) : (
        <div className="border border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500 text-xs">
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Action</th>
                <th className="text-left px-4 py-3 font-medium">Entity Type</th>
                <th className="text-left px-4 py-3 font-medium">Entity</th>
                <th className="text-left px-4 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((row: any) => {
                const metaStr = row.metadata ? JSON.stringify(row.metadata) : '—'
                const details = metaStr.length > 60 ? metaStr.slice(0, 60) + '…' : metaStr
                const entity = row.entity_name
                  ? row.entity_name
                  : row.entity_id
                  ? String(row.entity_id).slice(0, 8)
                  : '—'

                return (
                  <tr key={row.id} className="border-b border-neutral-800 last:border-b-0 hover:bg-neutral-900/50">
                    <td className="px-4 py-3 text-neutral-500 text-xs tabular-nums whitespace-nowrap">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="px-4 py-3 text-neutral-200">{formatAction(row.action)}</td>
                    <td className="px-4 py-3 text-neutral-400">{row.entity_type}</td>
                    <td className="px-4 py-3 font-mono text-xs text-neutral-400">{entity}</td>
                    <td className="px-4 py-3 font-mono text-xs text-neutral-500">{details}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
