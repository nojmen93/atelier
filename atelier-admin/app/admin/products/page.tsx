import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, subcategories(name, categories(name)), variants(id)')
    .eq('archived', false)
    .order('display_order', { ascending: true })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200"
        >
          New Product
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products?.map((product) => (
          <Link
            key={product.id}
            href={`/admin/products/${product.id}`}
            className="border border-neutral-800 rounded-lg p-6 hover:border-neutral-600 transition"
          >
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-48 object-cover rounded mb-4"
              />
            ) : (
              <div className="w-full h-48 bg-neutral-900 rounded mb-4 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-neutral-700">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
            )}
            <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
            <p className="text-neutral-500 text-sm">{product.material}</p>
            {product.subcategories && (
              <p className="text-neutral-500 text-xs mt-1">
                {(product.subcategories as { name: string; categories: { name: string } }).categories.name}
                {' / '}
                {(product.subcategories as { name: string; categories: { name: string } }).name}
              </p>
            )}
            <div className="mt-4 flex items-center gap-2">
              <span className={`px-2 py-1 text-xs rounded ${
                product.published
                  ? 'bg-green-900 text-green-100'
                  : 'bg-neutral-800 text-neutral-400'
              }`}>
                {product.published ? 'Published' : 'Draft'}
              </span>
              {(product.variants as { id: string }[])?.length > 0 && (
                <span className="px-2 py-1 text-xs rounded bg-neutral-800 text-neutral-400">
                  {(product.variants as { id: string }[]).length} variant{(product.variants as { id: string }[]).length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
