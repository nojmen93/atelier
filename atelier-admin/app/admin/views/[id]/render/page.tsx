import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ViewRuntime from '@/components/ViewRuntime'
import { mapRowToViewConfig } from '@/lib/view-attributes'

export default async function RenderViewPage({
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

  return <ViewRuntime config={config} />
}
