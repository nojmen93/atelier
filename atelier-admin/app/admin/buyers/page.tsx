import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import BuyerListClient from './BuyerListClient'

export default async function BuyersPage() {
  const supabase = createAdminClient()

  const { data: buyers } = await supabase
    .from('buyers')
    .select('id, company_name, contact_name, email, created_at')
    .order('created_at', { ascending: false })

  // Get style counts per buyer
  const { data: accessCounts } = await supabase
    .from('buyer_product_access')
    .select('buyer_id')

  const countMap: Record<string, number> = {}
  for (const row of accessCounts ?? []) {
    countMap[row.buyer_id] = (countMap[row.buyer_id] || 0) + 1
  }

  const buyersWithCounts = (buyers ?? []).map((b) => ({
    ...b,
    style_count: countMap[b.id] || 0,
  }))

  return (
    <div>
      <BuyerListClient buyers={buyersWithCounts} />
    </div>
  )
}
