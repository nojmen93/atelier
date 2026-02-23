import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) {
    notFound()
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Edit: {product.name}</h1>
      <div className="space-y-4">
        <div>
          <span className="text-neutral-400">Name:</span> {product.name}
        </div>
        <div>
          <span className="text-neutral-400">Description:</span> {product.description || 'N/A'}
        </div>
        <div>
          <span className="text-neutral-400">Material:</span> {product.material || 'N/A'}
        </div>
        <div>
          <span className="text-neutral-400">Base Cost:</span> €{product.base_cost || '0.00'}
        </div>
      </div>
      <p className="text-neutral-500 mt-8">Full edit form coming in next phase</p>
    </div>
  )
}
