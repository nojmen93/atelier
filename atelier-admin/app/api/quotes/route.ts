import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()

  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('quote_requests')
      .insert(body)
      .select('id, quote_number')
      .single()

    if (error) {
      // If quote_number column doesn't exist, retry without it
      if (error.message.includes('quote_number')) {
        const { quote_number, ...rest } = body
        const { data: fallback, error: fallbackErr } = await supabase
          .from('quote_requests')
          .insert(rest)
          .select('id')
          .single()

        if (fallbackErr) {
          return NextResponse.json({ error: fallbackErr.message }, { status: 400 })
        }
        return NextResponse.json({ id: fallback.id, quote_number: null })
      }

      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ id: data.id, quote_number: data.quote_number })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
