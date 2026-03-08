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

  const [orderRes, posRes] = await Promise.all([
    supabase
      .from('orders')
      .select('*, styles(id, name), suppliers(id, name), factories(id, name), quote_requests(id, customer_name, customer_company)')
      .eq('id', id)
      .single(),
    supabase
      .from('purchase_orders')
      .select('*, styles(id, name, images, suppliers(name))')
      .eq('order_id', id)
      .order('sort_order', { ascending: true }),
  ])

  if (!orderRes.data) {
    notFound()
  }

  return (
    <div className="max-w-4xl">
      <BackLink href="/admin/orders" label="Back to Orders" />
      <OrderDetailView order={orderRes.data} purchaseOrders={posRes.data || []} />
    </div>
  )
}
