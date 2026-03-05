import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BackLink from '@/components/BackLink'
import { mapRowToViewConfig } from '@/lib/view-attributes'

export default async function ExportViewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ ids?: string }>
}) {
  const { id } = await params
  const { ids } = await searchParams
  const supabase = await createClient()

  const { data: view } = await supabase
    .from('views')
    .select('*')
    .eq('id', id)
    .single()

  if (!view) {
    notFound()
  }

  const config = mapRowToViewConfig(view)
  const selectedIds = ids ? ids.split(',').filter(Boolean) : []

  return (
    <div className="max-w-2xl">
      <BackLink href={`/admin/views/${id}/render`} label="Back to View" />
      <h1 className="text-3xl font-bold mb-2">Export: {config.name}</h1>
      <p className="text-neutral-500 mb-8">
        {selectedIds.length > 0
          ? `${selectedIds.length} style${selectedIds.length !== 1 ? 's' : ''} selected for export`
          : 'All styles in this view will be exported'}
      </p>

      <div className="border border-neutral-800 rounded-lg p-6 space-y-4 mb-8">
        <h2 className="text-lg font-semibold">Export Settings</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-neutral-500">Page Size</span>
            <p>{config.export_options.page_size === 'a4' ? 'A4' : 'Letter'}</p>
          </div>
          <div>
            <span className="text-neutral-500">Header Text</span>
            <p>{config.export_options.header_text || '(none)'}</p>
          </div>
          <div>
            <span className="text-neutral-500">Include Images</span>
            <p>{config.export_options.include_images ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <span className="text-neutral-500">Include Header</span>
            <p>{config.export_options.include_header ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>

      <div className="border border-neutral-800 rounded-lg p-12 text-center">
        <p className="text-neutral-400 mb-2">PDF export is not yet available.</p>
        <p className="text-neutral-600 text-sm">This feature will generate a downloadable PDF based on the export settings configured in the view builder.</p>
      </div>
    </div>
  )
}
