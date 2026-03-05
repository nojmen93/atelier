import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CategoryEditForm from './CategoryEditForm'
import BackLink from '@/components/BackLink'

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: category }, { data: suppliers }] = await Promise.all([
    supabase
      .from('categories')
      .select('*, concepts(id, name)')
      .eq('id', id)
      .single(),
    supabase
      .from('suppliers')
      .select('id, name')
      .order('name'),
  ])

  if (!category) {
    notFound()
  }

  return (
    <div className="max-w-2xl">
      <BackLink href={`/admin/concepts/${category.concept_id}`} label="Back to Concept" />
      <CategoryEditForm
        category={category}
        conceptName={category.concepts?.name || ''}
        suppliers={suppliers || []}
      />
    </div>
  )
}
