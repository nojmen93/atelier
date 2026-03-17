import { getBuyer } from '@/lib/get-buyer'
import TopNav from '@/components/TopNav'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import AddToOrderButton from './AddToOrderButton'

export default async function StyleDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { supabase, buyer } = await getBuyer()

  // Verify buyer has access and get price_override
  const { data: access } = await supabase
    .from('buyer_product_access')
    .select('price_override')
    .eq('buyer_id', buyer.id)
    .eq('style_id', params.id)
    .eq('active', true)
    .single()

  if (!access) {
    notFound()
  }

  // Fetch style with category
  const { data: style } = await supabase
    .from('styles')
    .select('id, name, description, images, base_cost, category_id, categories(name)')
    .eq('id', params.id)
    .single()

  if (!style) {
    notFound()
  }

  // Fetch variants
  const { data: variants } = await supabase
    .from('variants')
    .select('id, size, color, sku, stock, price_modifier')
    .eq('style_id', params.id)
    .order('color')
    .order('size')

  const price = access.price_override ?? style.base_cost

  // Group variants by color
  const variantsByColor: Record<string, typeof variants> = {}
  for (const v of variants ?? []) {
    const color = v.color || 'Default'
    if (!variantsByColor[color]) {
      variantsByColor[color] = []
    }
    variantsByColor[color]!.push(v)
  }

  const heroImage = style.images?.[0] ?? null
  const category = (style as any).categories?.name ?? null

  return (
    <div className="min-h-screen">
      <TopNav companyName={buyer.company_name} />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <Link
          href="/catalog"
          className="text-xs text-neutral-500 hover:text-foreground transition"
        >
          &larr; Back to catalog
        </Link>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image */}
          <div className="aspect-[4/5] relative overflow-hidden rounded-md bg-neutral-900">
            {heroImage ? (
              <img
                src={heroImage}
                alt={style.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-700">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {category && (
              <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                {category}
              </p>
            )}
            <h1 className="text-2xl font-semibold">{style.name}</h1>

            {price != null && (
              <p className="mt-3 text-lg">
                &euro;{Number(price).toFixed(2)}
              </p>
            )}

            {style.description && (
              <p className="mt-4 text-sm text-neutral-400 leading-relaxed">
                {style.description}
              </p>
            )}

            {/* Variants by color */}
            {Object.keys(variantsByColor).length > 0 && (
              <div className="mt-8 space-y-5">
                <h2 className="text-xs text-neutral-500 uppercase tracking-wider">
                  Available variants
                </h2>
                {Object.entries(variantsByColor).map(([color, colorVariants]) => (
                  <div key={color}>
                    <div className="flex items-center gap-2 mb-2">
                      <ColorSwatch color={color} />
                      <span className="text-sm font-medium">{color}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {colorVariants!.map((v) => (
                        <span
                          key={v.id}
                          className={`text-xs px-3 py-1.5 rounded border ${
                            v.stock > 0
                              ? 'border-neutral-700 text-neutral-300'
                              : 'border-neutral-800 text-neutral-600 line-through'
                          }`}
                        >
                          {v.size || 'One Size'}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-10">
              <AddToOrderButton />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function ColorSwatch({ color }: { color: string }) {
  const colorMap: Record<string, string> = {
    Black: '#000000',
    White: '#FFFFFF',
    Navy: '#1B2A4A',
    Red: '#C0392B',
    Blue: '#2980B9',
    Green: '#27AE60',
    Grey: '#7F8C8D',
    Gray: '#7F8C8D',
    Beige: '#D4C5A9',
    Brown: '#6D4C41',
    Pink: '#E91E8C',
    Yellow: '#F1C40F',
    Orange: '#E67E22',
    Purple: '#8E44AD',
  }

  const hex = colorMap[color]

  if (!hex) return null

  return (
    <span
      className="w-3 h-3 rounded-full border border-neutral-700 inline-block"
      style={{ backgroundColor: hex }}
    />
  )
}
