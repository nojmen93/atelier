import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SortableProductList from '@/components/SortableProductList'

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

      <SortableProductList initialProducts={products || []} />
    </div>
  )
}
