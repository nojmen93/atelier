import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import OrderDetailView from './OrderDetailView'
import BackLink from '@/components/BackLink'

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*, styles(id, name), suppliers(id, name), factories(id, name), quote_requests(id, customer_name, customer_company)')
    .eq('id', id)
    .single()

  if (!order) {
    notFound()
  }

  return (
    <div className="max-w-3xl">
      <BackLink href="/admin/orders" label="Back to Orders" />
      <OrderDetailView order={order} />
    </div>
  )
}
