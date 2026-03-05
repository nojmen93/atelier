import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SortableConceptList from '@/components/SortableConceptList'

export default async function ConceptsPage() {
  const supabase = await createClient()

  const { data: concepts } = await supabase
    .from('concepts')
    .select('*, categories(id, name, slug, display_order)')
    .order('display_order', { ascending: true })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Concepts</h1>
        <Link
          href="/admin/concepts/new"
          className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
        >
          New Concept
        </Link>
      </div>

      <SortableConceptList initialConcepts={concepts || []} />
    </div>
  )
}
