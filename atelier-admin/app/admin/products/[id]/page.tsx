import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductEditForm from './ProductEditForm'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase
      .from('categories')
      .select('id, name, subcategories(id, name)')
      .order('display_order', { ascending: true }),
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className="max-w-4xl">
      <ProductEditForm product={product} categories={categories || []} />
    </div>
  )
}
