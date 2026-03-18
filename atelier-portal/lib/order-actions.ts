'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'

async function getBuyerId() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const db = createServiceClient()
  const { data: buyer } = await db
    .from('buyers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!buyer) redirect('/access-pending')
  return { db, buyerId: buyer.id }
}

/** Verify that an order belongs to this buyer. Returns order ID or null. */
async function verifyOrderOwnership(db: ReturnType<typeof createServiceClient>, orderId: string, buyerId: string) {
  const { data } = await db
    .from('buyer_orders')
    .select('id')
    .eq('id', orderId)
    .eq('buyer_id', buyerId)
    .single()
  return data
}

/** Verify that a line item belongs to one of the buyer's orders. Returns order_id or null. */
async function verifyLineItemOwnership(db: ReturnType<typeof createServiceClient>, lineItemId: string, buyerId: string) {
  const { data: item } = await db
    .from('buyer_order_line_items')
    .select('order_id')
    .eq('id', lineItemId)
    .single()

  if (!item) return null

  const order = await verifyOrderOwnership(db, item.order_id, buyerId)
  return order ? item.order_id : null
}

export async function addToOrder(styleId: string, variantId: string) {
  const { db, buyerId } = await getBuyerId()

  // Server-side price calculation — never trust client
  const { data: variant } = await db
    .from('variants')
    .select('id, price_modifier, stock, style_id')
    .eq('id', variantId)
    .eq('style_id', styleId)
    .single()

  if (!variant) return { error: 'Invalid variant' }
  if (variant.stock <= 0) return { error: 'This variant is out of stock' }

  const { data: style } = await db
    .from('styles')
    .select('base_cost')
    .eq('id', styleId)
    .single()

  if (!style) return { error: 'Style not found' }

  const { data: access } = await db
    .from('buyer_product_access')
    .select('price_override')
    .eq('buyer_id', buyerId)
    .eq('style_id', styleId)
    .eq('active', true)
    .single()

  if (!access) return { error: 'You do not have access to this product' }

  const basePrice = access.price_override ?? style.base_cost ?? 0
  const unitPrice = Number(basePrice) + Number(variant.price_modifier ?? 0)

  // Find or create draft order
  let { data: draft } = await db
    .from('buyer_orders')
    .select('id')
    .eq('buyer_id', buyerId)
    .eq('status', 'draft')
    .single()

  if (!draft) {
    const { data: newOrder, error } = await db
      .from('buyer_orders')
      .insert({ buyer_id: buyerId, status: 'draft' })
      .select('id')
      .single()
    if (error || !newOrder) return { error: 'Failed to create order: ' + error?.message }
    draft = newOrder
  }

  // Check if this variant already exists in the draft
  const { data: existing } = await db
    .from('buyer_order_line_items')
    .select('id, quantity')
    .eq('order_id', draft.id)
    .eq('variant_id', variantId)
    .single()

  if (existing) {
    const { error: updErr } = await db
      .from('buyer_order_line_items')
      .update({ quantity: existing.quantity + 1 })
      .eq('id', existing.id)
    if (updErr) return { error: 'Failed to update quantity' }
  } else {
    const { error } = await db
      .from('buyer_order_line_items')
      .insert({
        order_id: draft.id,
        style_id: styleId,
        variant_id: variantId,
        quantity: 1,
        unit_price: unitPrice,
      })
    if (error) return { error: 'Failed to add item: ' + error.message }
  }

  return { success: true }
}

export async function updateLineItemQuantity(lineItemId: string, quantity: number) {
  const { db, buyerId } = await getBuyerId()

  if (quantity < 1) return { error: 'Quantity must be at least 1' }

  const orderId = await verifyLineItemOwnership(db, lineItemId, buyerId)
  if (!orderId) return { error: 'Item not found' }

  const { error } = await db
    .from('buyer_order_line_items')
    .update({ quantity })
    .eq('id', lineItemId)

  if (error) return { error: 'Failed to update quantity' }
  return { success: true }
}

export async function updateLineItemNotes(lineItemId: string, placementNotes: string) {
  const { db, buyerId } = await getBuyerId()

  const orderId = await verifyLineItemOwnership(db, lineItemId, buyerId)
  if (!orderId) return { error: 'Item not found' }

  const { error } = await db
    .from('buyer_order_line_items')
    .update({ placement_notes: placementNotes })
    .eq('id', lineItemId)

  if (error) return { error: 'Failed to update notes' }
  return { success: true }
}

export async function removeLineItem(lineItemId: string) {
  const { db, buyerId } = await getBuyerId()

  const orderId = await verifyLineItemOwnership(db, lineItemId, buyerId)
  if (!orderId) return { error: 'Item not found' }

  const { error: delErr } = await db
    .from('buyer_order_line_items')
    .delete()
    .eq('id', lineItemId)

  if (delErr) return { error: 'Failed to remove item' }

  // Check if order has any remaining items
  const { count } = await db
    .from('buyer_order_line_items')
    .select('id', { count: 'exact', head: true })
    .eq('order_id', orderId)

  if (count === 0) {
    await db
      .from('buyer_orders')
      .delete()
      .eq('id', orderId)
    return { success: true, orderDeleted: true }
  }

  return { success: true, orderDeleted: false }
}

export async function updateOrderNotes(orderId: string, notes: string) {
  const { db, buyerId } = await getBuyerId()

  const order = await verifyOrderOwnership(db, orderId, buyerId)
  if (!order) return { error: 'Order not found' }

  const { error } = await db
    .from('buyer_orders')
    .update({ notes })
    .eq('id', orderId)

  if (error) return { error: 'Failed to update notes' }
  return { success: true }
}

export async function submitOrder(orderId: string) {
  const { db, buyerId } = await getBuyerId()

  const order = await verifyOrderOwnership(db, orderId, buyerId)
  if (!order) return { error: 'Order not found' }

  const { error } = await db
    .from('buyer_orders')
    .update({
      status: 'confirmed',
      submitted_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .eq('status', 'draft')

  if (error) return { error: 'Failed to submit order' }
  redirect(`/orders/${orderId}`)
}
