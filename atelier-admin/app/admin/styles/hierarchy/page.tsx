import { createClient } from '@/lib/supabase/server'
import HierarchyBrowser from './HierarchyBrowser'

export default async function HierarchyPage() {
  const supabase = await createClient()

  const { data: concepts } = await supabase
    .from('concepts')
    .select('*, categories(id, name, slug, display_order)')
    .order('display_order', { ascending: true })

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Hierarchy</h1>
      <p className="text-neutral-500 text-sm mb-8">
        Select a concept and category to filter the Style Gallery.
      </p>
      <HierarchyBrowser concepts={concepts || []} />
    </div>
  )
}
