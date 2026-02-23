import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, subcategories(name, categories(name))')
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
            {product.images?.[0] && (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-48 object-cover rounded mb-4"
              />
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
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
