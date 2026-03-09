import { createClient } from '@/lib/supabase/server'
import OrderList from './OrderList'

export default async function OrdersPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, styles(name), suppliers(name), factories(name), quote_requests(customer_name, customer_company)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <OrderList orders={orders || []} />
    </div>
  )
}
