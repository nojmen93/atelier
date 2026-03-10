import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createAdminClient()
  const styleId = request.nextUrl.searchParams.get('styleId')

  let query = supabase
    .from('product_skus')
    .select('*, styles(name, categories:category_id(name)), colours!colour_id(colour_name, hex_value, colour_code, g1_code)')
    .order('created_at', { ascending: false })

  if (styleId) {
    query = query.eq('style_id', styleId)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()
  const body = await request.json()

  // Support bulk insert (array) or single insert (object)
  const rows = Array.isArray(body) ? body : [body]

  const { data, error } = await supabase
    .from('product_skus')
    .insert(rows)
    .select('*, styles(name, categories:category_id(name)), colours!colour_id(colour_name, hex_value, colour_code, g1_code)')

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  const supabase = createAdminClient()
  const body = await request.json()
  const { id, ...updates } = body

  const { data, error } = await supabase
    .from('product_skus')
    .update(updates)
    .eq('id', id)
    .select('*, styles(name, categories:category_id(name)), colours!colour_id(colour_name, hex_value, colour_code, g1_code)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient()
  const { id } = await request.json()

  const { error } = await supabase
    .from('product_skus')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
