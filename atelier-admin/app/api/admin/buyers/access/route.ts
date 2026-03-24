import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(req: NextRequest) {
  // Verify admin is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { action } = body

  const db = createAdminClient()

  if (action === 'toggle') {
    const { accessId, active } = body
    if (!accessId || typeof active !== 'boolean') {
      return NextResponse.json({ error: 'Missing accessId or active' }, { status: 400 })
    }
    const { error } = await db
      .from('buyer_product_access')
      .update({ active })
      .eq('id', accessId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (action === 'price') {
    const { accessId, price } = body
    if (!accessId) {
      return NextResponse.json({ error: 'Missing accessId' }, { status: 400 })
    }
    const priceValue = price !== undefined && price !== '' ? parseFloat(price) : null
    const { error } = await db
      .from('buyer_product_access')
      .update({ price_override: priceValue })
      .eq('id', accessId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (action === 'assign') {
    const { buyerId, styleIds } = body
    if (!buyerId || !Array.isArray(styleIds) || styleIds.length === 0) {
      return NextResponse.json({ error: 'Missing buyerId or styleIds' }, { status: 400 })
    }
    const rows = styleIds.map((style_id: string) => ({
      buyer_id: buyerId,
      style_id,
      active: true,
    }))
    const { error } = await db.from('buyer_product_access').insert(rows)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
