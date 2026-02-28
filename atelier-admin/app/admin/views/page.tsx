import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ViewsPage() {
  const supabase = await createClient()

  const { data: views } = await supabase
    .from('views')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Views</h1>
        <Link
          href="/admin/views/new"
          className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
        >
          New View
        </Link>
      </div>

      {(!views || views.length === 0) ? (
        <div className="border border-neutral-800 rounded-lg p-12 text-center">
          <p className="text-neutral-400 mb-4">No views created yet.</p>
          <p className="text-neutral-500 text-sm">Views let you create custom grid or gallery layouts for your styles, with filters, grouping, and PDF export.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {views.map((view) => (
            <div key={view.id} className="border border-neutral-800 rounded-lg overflow-hidden hover:border-neutral-600 transition">
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">{view.name}</h3>
                  <div className="flex items-center gap-2">
                    {view.is_default && (
                      <span className="px-2 py-0.5 text-xs bg-green-900 text-green-100 rounded">Default</span>
                    )}
                    <span className={`px-2 py-0.5 text-xs rounded ${
                      view.type === 'gallery'
                        ? 'bg-blue-900 text-blue-100'
                        : 'bg-purple-900 text-purple-100'
                    }`}>
                      {view.type === 'gallery' ? 'Gallery' : 'Grid'}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-neutral-500 mb-4">
                  {(view.selected_attributes as string[])?.length || 0} attributes
                  {(view.filters as unknown[])?.length > 0 && ` · ${(view.filters as unknown[]).length} filter${(view.filters as unknown[]).length !== 1 ? 's' : ''}`}
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/views/${view.id}/render`}
                    className="flex-1 px-4 py-2 bg-white text-black text-sm font-medium rounded text-center hover:bg-neutral-200 transition"
                  >
                    Open
                  </Link>
                  <Link
                    href={`/admin/views/${view.id}`}
                    className="px-4 py-2 text-sm border border-neutral-700 text-neutral-300 rounded hover:bg-neutral-800 transition"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
