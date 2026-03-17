import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('styles')
    .select(`
      id,
      name,
      display_name,
      description,
      material,
      images,
      categories(name),
      style_colours(colour:colours(colour_name, hex_value)),
      variants(size)
    `)
    .eq('show_on_website', true)
    .order('name', { ascending: true })

  if (error) {
    console.error('Failed to fetch public products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }

  // Shape the data: extract unique colours and sizes
  const products = (data ?? []).map((p: any) => {
    const colours = (p.style_colours ?? []).map((sc: any) => sc.colour).filter(Boolean)
    const sizes = Array.from(
      new Set((p.variants ?? []).map((v: any) => v.size).filter(Boolean) as string[])
    )
    return {
      id: p.id,
      name: p.name,
      display_name: p.display_name,
      description: p.description,
      material: p.material,
      images: p.images,
      categories: p.categories,
      colours,
      sizes,
    }
  })

  return NextResponse.json(products)
}
