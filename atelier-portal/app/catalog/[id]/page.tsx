import { getBuyer } from '@/lib/get-buyer'
import { getPendingOrderCount } from '@/lib/get-pending-order-count'
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
  const pendingOrderCount = await getPendingOrderCount(buyer.id)

  return (
    <div className="min-h-screen">
      <TopNav companyName={buyer.company_name} pendingOrderCount={pendingOrderCount} />
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

            <div className="mt-8">
              <AddToOrderButton
                styleId={style.id}
                unitPrice={price != null ? Number(price) : 0}
                variantsByColor={variantsByColor as any}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
