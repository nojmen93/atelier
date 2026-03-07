import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SortableStyleList from '@/components/SortableStyleList'
import StyleGalleryFilter from '@/components/StyleGalleryFilter'

export default async function ProductGalleryPage() {
  const supabase = await createClient()

  const { data: styles } = await supabase
    .from('styles')
    .select('*, categories(name, concepts(name)), variants(id)')
    .neq('status', 'archived')
    .order('display_order', { ascending: true })

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Product Gallery</h1>
        <Link
          href="/admin/styles/new"
          className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200"
        >
          New Product
        </Link>
      </div>
      <StyleGalleryFilter />

      {(!styles || styles.length === 0) ? (
        <div className="border border-neutral-800 border-dashed rounded-lg p-16 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-5 text-neutral-600">
            <path d="M20.38 3.46L16 2 12 3.46 8 2 3.62 3.46a2 2 0 00-1.34 1.89v13.3a2 2 0 001.34 1.89L8 22l4-1.46L16 22l4.38-1.46a2 2 0 001.34-1.89V5.35a2 2 0 00-1.34-1.89z" />
            <line x1="12" y1="22" x2="12" y2="3.46" />
          </svg>
          <h3 className="text-lg font-semibold text-neutral-300 mb-2">No products yet</h3>
          <p className="text-neutral-500 text-sm mb-6 max-w-sm mx-auto">Create your first product to start building your collection.</p>
          <Link
            href="/admin/styles/new"
            className="inline-block px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
          >
            Create First Product
          </Link>
        </div>
      ) : (
        <SortableStyleList initialStyles={styles} />
      )}
    </div>
  )
}
