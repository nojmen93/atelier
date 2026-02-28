import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BackLink from '@/components/BackLink'
import ViewBuilder from '@/components/ViewBuilder'
import { mapRowToViewConfig } from '@/lib/view-attributes'

export default async function EditViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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

  return (
    <div className="max-w-4xl">
      <BackLink href="/admin/views" label="Back to Views" />
      <ViewBuilder initialConfig={config} viewId={id} />
    </div>
  )
}
