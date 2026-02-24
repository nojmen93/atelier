import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import StyleEditForm from './StyleEditForm'
import BackLink from '@/components/BackLink'

export default async function EditStylePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: style }, { data: concepts }, { data: suppliers }] = await Promise.all([
    supabase.from('styles').select('*').eq('id', id).single(),
    supabase
      .from('concepts')
      .select('id, name, categories(id, name, default_moq, default_supplier_id, default_lead_time_days)')
      .order('display_order', { ascending: true }),
    supabase
      .from('suppliers')
      .select('id, name')
      .order('name'),
  ])

  if (!style) {
    notFound()
  }

  return (
    <div className="max-w-4xl">
      <BackLink href="/admin/styles" label="Back to Styles" />
      <StyleEditForm
        style={style}
        concepts={concepts || []}
        suppliers={suppliers || []}
      />
    </div>
  )
}
