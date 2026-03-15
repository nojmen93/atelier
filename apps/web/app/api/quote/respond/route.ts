import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { secretId, action, message } = body

  if (!secretId || !action || !['approved', 'revision'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Use service role key for writes — never exposed to the client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: quote, error: findError } = await supabase
    .from('client_quotes')
    .select('id, status')
    .eq('secret_id', secretId)
    .single()

  if (findError || !quote) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  }

  if (['approved', 'revision', 'declined', 'expired'].includes(quote.status)) {
    return NextResponse.json({ error: 'Quote already responded to' }, { status: 409 })
  }

  const { error: updateError } = await supabase
    .from('client_quotes')
    .update({
      status: action,
      client_response_action: action,
      client_response_message: message ?? null,
      client_responded_at: new Date().toISOString(),
    })
    .eq('id', quote.id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
