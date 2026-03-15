import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, email, company, phone, productInterest, quantity, message } = body

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Name, email and message are required' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase.from('quote_requests').insert({
    customer_name: name,
    customer_email: email,
    customer_company: company || null,
    customer_phone: phone || null,
    product_name: productInterest || null,
    quantity: quantity ? parseInt(quantity.split('-')[0]) : 1,
    message: message,
    customization_preferences: quantity ? { quantity_range: quantity } : {},
    status: 'new',
  })

  if (error) {
    console.error('Supabase insert error:', error)
    return NextResponse.json({ error: 'Failed to save request' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
