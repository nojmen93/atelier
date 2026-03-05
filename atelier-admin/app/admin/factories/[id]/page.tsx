import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import FactoryEditForm from './FactoryEditForm'
import BackLink from '@/components/BackLink'

export default async function EditFactoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: factory } = await supabase
    .from('factories')
    .select('*')
    .eq('id', id)
    .single()

  if (!factory) {
    notFound()
  }

  return (
    <div className="max-w-2xl">
      <BackLink href="/admin/factories" label="Back to Factories" />
      <FactoryEditForm factory={factory} />
    </div>
  )
}
