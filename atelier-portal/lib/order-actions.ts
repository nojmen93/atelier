'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

async function getBuyerId() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: buyer } = await supabase
    .from('buyers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!buyer) redirect('/access-pending')
  return { supabase, buyerId: buyer.id }
}

export async function addToOrder(styleId: string, variantId: string, unitPrice: number) {
  const { supabase, buyerId } = await getBuyerId()

  // Find or create draft order
  let { data: draft } = await supabase
    .from('buyer_orders')
    .select('id')
    .eq('buyer_id', buyerId)
    .eq('status', 'draft')
    .single()

  if (!draft) {
    const { data: newOrder, error } = await supabase
      .from('buyer_orders')
      .insert({ buyer_id: buyerId, status: 'draft' })
      .select('id')
      .single()
    if (error || !newOrder) return { error: 'Failed to create order' }
    draft = newOrder
  }

  // Check if this variant already exists in the draft
  const { data: existing } = await supabase
    .from('buyer_order_line_items')
    .select('id, quantity')
    .eq('order_id', draft.id)
    .eq('variant_id', variantId)
    .single()

  if (existing) {
    await supabase
      .from('buyer_order_line_items')
      .update({ quantity: existing.quantity + 1 })
      .eq('id', existing.id)
  } else {
    const { error } = await supabase
      .from('buyer_order_line_items')
      .insert({
        order_id: draft.id,
        style_id: styleId,
        variant_id: variantId,
        quantity: 1,
        unit_price: unitPrice,
      })
    if (error) return { error: 'Failed to add item' }
  }

  return { success: true }
}

export async function updateLineItemQuantity(lineItemId: string, quantity: number) {
  const { supabase } = await getBuyerId()

  if (quantity < 1) return { error: 'Quantity must be at least 1' }

  const { error } = await supabase
    .from('buyer_order_line_items')
    .update({ quantity })
    .eq('id', lineItemId)

  if (error) return { error: 'Failed to update quantity' }
  return { success: true }
}

export async function updateLineItemNotes(lineItemId: string, placementNotes: string) {
  const { supabase } = await getBuyerId()

  const { error } = await supabase
    .from('buyer_order_line_items')
    .update({ placement_notes: placementNotes })
    .eq('id', lineItemId)

  if (error) return { error: 'Failed to update notes' }
  return { success: true }
}

export async function removeLineItem(lineItemId: string) {
  const { supabase, buyerId } = await getBuyerId()

  // Get the order_id before deleting
  const { data: item } = await supabase
    .from('buyer_order_line_items')
    .select('order_id')
    .eq('id', lineItemId)
    .single()

  if (!item) return { error: 'Item not found' }

  await supabase
    .from('buyer_order_line_items')
    .delete()
    .eq('id', lineItemId)

  // Check if order has any remaining items
  const { count } = await supabase
    .from('buyer_order_line_items')
    .select('id', { count: 'exact', head: true })
    .eq('order_id', item.order_id)

  if (count === 0) {
    await supabase
      .from('buyer_orders')
      .delete()
      .eq('id', item.order_id)
    return { success: true, orderDeleted: true }
  }

  return { success: true, orderDeleted: false }
}

export async function updateOrderNotes(orderId: string, notes: string) {
  const { supabase } = await getBuyerId()

  const { error } = await supabase
    .from('buyer_orders')
    .update({ notes })
    .eq('id', orderId)

  if (error) return { error: 'Failed to update notes' }
  return { success: true }
}

export async function submitOrder(orderId: string) {
  const { supabase } = await getBuyerId()

  const { error } = await supabase
    .from('buyer_orders')
    .update({
      status: 'pending',
      submitted_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .eq('status', 'draft')

  if (error) return { error: 'Failed to submit order' }
  redirect(`/orders/${orderId}`)
}
