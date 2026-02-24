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

  const { data: category } = await supabase
    .from('categories')
    .select('*, subcategories(*)')
    .eq('id', id)
    .single()

  if (!category) {
    notFound()
  }

  const subcategories = (category.subcategories || []).sort(
    (a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order
  )

  return (
    <div className="max-w-2xl">
      <BackLink href="/admin/categories" label="Back to Categories" />
      <CategoryEditForm category={category} subcategories={subcategories} />
    </div>
  )
}
