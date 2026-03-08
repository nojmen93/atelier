import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()

  try {
    const { order, purchaseOrders } = await request.json()

    // Insert the order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert(order)
      .select('id')
      .single()

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 400 })
    }

    // Insert POs and their lines
    const createdPOs: { po_number: string; line_count: number }[] = []

    for (const po of purchaseOrders) {
      const { lines, ...poData } = po

      const { data: poResult, error: poError } = await supabase
        .from('purchase_orders')
        .insert({ ...poData, order_id: orderData.id })
        .select('id')
        .single()

      if (poError) {
        console.error('PO insert error:', poError.message)
        continue
      }

      if (lines && lines.length > 0) {
        const lineRows = lines.map((line: Record<string, unknown>) => ({
          ...line,
          purchase_order_id: poResult.id,
        }))

        const { error: linesError } = await supabase.from('po_lines').insert(lineRows)
        if (linesError) {
          console.error('PO lines insert error:', linesError.message)
        }
      }

      createdPOs.push({ po_number: poData.po_number, line_count: lines?.length || 0 })
    }

    return NextResponse.json({
      id: orderData.id,
      purchase_orders: createdPOs,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
