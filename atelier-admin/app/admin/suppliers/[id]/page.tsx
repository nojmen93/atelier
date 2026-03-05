import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import SupplierEditForm from './SupplierEditForm'
import BackLink from '@/components/BackLink'

export default async function EditSupplierPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: supplier } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single()

  if (!supplier) {
    notFound()
  }

  return (
    <div className="max-w-2xl">
      <BackLink href="/admin/suppliers" label="Back to Suppliers" />
      <SupplierEditForm supplier={supplier} />
    </div>
  )
}
