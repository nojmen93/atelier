import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ConceptEditForm from './ConceptEditForm'
import BackLink from '@/components/BackLink'

export default async function EditConceptPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: concept } = await supabase
    .from('concepts')
    .select('*, categories(id, name, slug, description, display_order)')
    .eq('id', id)
    .single()

  if (!concept) {
    notFound()
  }

  const categories = (concept.categories || []).sort(
    (a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order
  )

  return (
    <div className="max-w-2xl">
      <BackLink href="/admin/concepts" label="Back to Concepts" />
      <ConceptEditForm concept={concept} categories={categories} />
    </div>
  )
}
