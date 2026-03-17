import { getBuyer } from '@/lib/get-buyer'
import TopNav from '@/components/TopNav'
import Link from 'next/link'
import Image from 'next/image'

export default async function CatalogPage() {
  const { supabase, buyer } = await getBuyer()

  const { data: accessRows } = await supabase
    .from('buyer_product_access')
    .select('style_id, price_override, styles(id, name, images, category_id, base_cost, categories(name))')
    .eq('buyer_id', buyer.id)
    .eq('active', true)

  const styles = (accessRows ?? [])
    .map((row: any) => ({
      id: row.styles?.id as string,
      name: row.styles?.name as string,
      image: row.styles?.images?.[0] ?? null,
      category: row.styles?.categories?.name ?? null,
      price: row.price_override ?? row.styles?.base_cost ?? null,
    }))
    .filter((s) => s.id)

  return (
    <div className="min-h-screen">
      <TopNav companyName={buyer.company_name} />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-xl font-semibold mb-8">Catalog</h1>

        {styles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-lg text-neutral-300">Your catalog is being prepared</p>
            <p className="mt-2 text-sm text-neutral-500">
              Products will appear here once your account is set up.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {styles.map((style) => (
              <Link
                key={style.id}
                href={`/catalog/${style.id}`}
                className="group block"
              >
                <div className="aspect-[4/5] relative overflow-hidden rounded-md bg-neutral-900">
                  {style.image ? (
                    <img
                      src={style.image}
                      alt={style.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-700">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-sm font-medium group-hover:text-white transition">
                    {style.name}
                  </p>
                  {style.category && (
                    <p className="text-xs text-neutral-500 mt-0.5">{style.category}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
