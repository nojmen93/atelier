import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

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

      <div className="space-y-4">
        {categories?.map((category) => (
          <Link
            key={category.id}
            href={`/admin/categories/${category.id}`}
            className="block border border-neutral-800 rounded-lg p-6 hover:border-neutral-600 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold">{category.name}</h3>
              <span className="text-sm text-neutral-500">/{category.slug}</span>
            </div>
            {category.description && (
              <p className="text-neutral-400 text-sm mb-4">{category.description}</p>
            )}
            {category.subcategories && category.subcategories.length > 0 && (
              <div className="mt-3 pt-3 border-t border-neutral-800">
                <span className="text-xs text-neutral-500 uppercase tracking-wide">Subcategories</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {category.subcategories
                    .sort((a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order)
                    .map((sub: { id: string; name: string }) => (
                      <span
                        key={sub.id}
                        className="px-3 py-1 text-sm bg-neutral-800 text-neutral-300 rounded"
                      >
                        {sub.name}
                      </span>
                    ))}
                </div>
              </div>
            )}
            {(!category.subcategories || category.subcategories.length === 0) && (
              <p className="text-neutral-600 text-sm mt-2">No subcategories</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
