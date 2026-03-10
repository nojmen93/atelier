import { createClient } from '@/lib/supabase/server'
import HierarchyBrowser from './HierarchyBrowser'

export default async function HierarchyPage() {
  const supabase = await createClient()

  const [{ data: concepts }, { data: styles }] = await Promise.all([
    supabase
      .from('concepts')
      .select('*, categories(id, name, slug, display_order)')
      .order('display_order', { ascending: true }),
    supabase
      .from('styles')
      .select('id, concept_id, gender, category_id')
      .eq('active', true),
  ])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Product Hierarchy</h1>
      <p className="text-neutral-500 text-sm mb-8">
        Navigate: Concept &rarr; Gender &rarr; Category to filter the Product Gallery.
      </p>
      <HierarchyBrowser concepts={concepts || []} styles={styles || []} />
    </div>
  )
}
