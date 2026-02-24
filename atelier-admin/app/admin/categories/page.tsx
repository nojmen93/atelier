import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SortableCategoryList from '@/components/SortableCategoryList'

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*, subcategories(*)')
    .order('display_order', { ascending: true })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Link
          href="/admin/categories/new"
          className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
        >
          New Category
        </Link>
      </div>

      <SortableCategoryList initialCategories={categories || []} />
    </div>
  )
}
