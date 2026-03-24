import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAudit } from '@/lib/audit'

const VALID_STATUSES = ['pending', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled']

export async function PATCH(req: NextRequest) {
  // Verify admin is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderId, status } = await req.json()

  if (!orderId || !status) {
    return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 })
  }

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Fetch current status before updating
  const { data: existing } = await admin
    .from('buyer_orders')
    .select('status')
    .eq('id', orderId)
    .single()

  const { error } = await admin
    .from('buyer_orders')
    .update({ status })
    .eq('id', orderId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await logAudit({
    action: 'buyer_order_status_changed',
    entityType: 'buyer_order',
    entityId: orderId,
    userId: user.id,
    metadata: { old_status: existing?.status ?? null, new_status: status },
  })

  return NextResponse.json({ success: true })
}
