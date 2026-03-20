import { createServiceClient } from '@/lib/supabase/service'

export async function getPendingOrderCount(buyerId: string): Promise<number> {
  const db = createServiceClient()
  const { count } = await db
    .from('buyer_orders')
    .select('id', { count: 'exact', head: true })
    .eq('buyer_id', buyerId)
    .eq('status', 'confirmed')

  return count ?? 0
}
