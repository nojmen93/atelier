import { createAdminClient } from '@/lib/supabase/admin'

interface AuditRow {
  id: string
  action: string
  entity_type: string
  entity_id: string | null
  entity_name: string | null
  user_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

function formatAction(action: string): string {
  const label = action.replace(/_/g, ' ')
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function formatEntity(row: AuditRow): string {
  if (row.entity_name) return row.entity_name
  if (row.entity_id) return row.entity_id.slice(0, 8)
  return '—'
}

function formatMetadata(metadata: Record<string, unknown> | null): string {
  if (!metadata) return '—'
  const str = JSON.stringify(metadata)
  if (str.length > 60) return str.slice(0, 59) + '…'
  return str
}

export default async function AuditLogPage() {
  const admin = createAdminClient()
  const { data: rows } = await admin
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  const entries = (rows ?? []) as AuditRow[]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Audit Log</h1>
      <p className="text-neutral-500 mb-8">Last 100 admin actions</p>

      {entries.length === 0 ? (
        <div className="border border-neutral-800 rounded-lg p-12 text-center">
          <p className="text-neutral-400">No audit entries yet.</p>
        </div>
      ) : (
        <div className="border border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/50">
                <th className="text-left px-4 py-3 text-neutral-400 font-medium">Date</th>
                <th className="text-left px-4 py-3 text-neutral-400 font-medium">Action</th>
                <th className="text-left px-4 py-3 text-neutral-400 font-medium">Entity Type</th>
                <th className="text-left px-4 py-3 text-neutral-400 font-medium">Entity</th>
                <th className="text-left px-4 py-3 text-neutral-400 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((row) => (
                <tr key={row.id} className="border-b border-neutral-800 last:border-0 hover:bg-neutral-900/50">
                  <td className="px-4 py-3 text-neutral-300 whitespace-nowrap">
                    {formatDate(row.created_at)}
                  </td>
                  <td className="px-4 py-3 text-white whitespace-nowrap">
                    {formatAction(row.action)}
                  </td>
                  <td className="px-4 py-3 text-neutral-400 whitespace-nowrap">
                    {row.entity_type}
                  </td>
                  <td className="px-4 py-3 text-neutral-300 whitespace-nowrap">
                    {formatEntity(row)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-500 max-w-xs truncate">
                    {formatMetadata(row.metadata)}
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
