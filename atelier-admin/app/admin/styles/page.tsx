import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SortableStyleList from '@/components/SortableStyleList'

export default async function StylesPage() {
  const supabase = await createClient()

  const { data: styles } = await supabase
    .from('styles')
    .select('*, categories(name, concepts(name)), variants(id)')
    .neq('status', 'archived')
    .order('display_order', { ascending: true })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Styles</h1>
        <Link
          href="/admin/styles/new"
          className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200"
        >
          New Style
        </Link>
      </div>

      <SortableStyleList initialStyles={styles || []} />
    </div>
  )
}
