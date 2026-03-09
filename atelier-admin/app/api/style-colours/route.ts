import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createAdminClient()
  const styleId = request.nextUrl.searchParams.get('styleId')

  if (!styleId) {
    return NextResponse.json({ error: 'styleId required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('style_colours')
    .select('*, colour:colours(*)')
    .eq('style_id', styleId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()
  const { style_id, colour_id } = await request.json()

  const { data, error } = await supabase
    .from('style_colours')
    .insert({ style_id, colour_id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient()
  const { style_id, colour_id } = await request.json()

  const { error } = await supabase
    .from('style_colours')
    .delete()
    .eq('style_id', style_id)
    .eq('colour_id', colour_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
