'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/components/ImageUpload'
import VariantTable from '@/components/VariantTable'

interface Product {
  id: string
  name: string
  description: string | null
  material: string | null
  base_cost: number | null
  published: boolean
  subcategory_id: string | null
  images: string[] | null
}

interface Category {
  id: string
  name: string
  subcategories: { id: string; name: string }[]
}

export default function ProductEditForm({
  product,
  categories,
}: {
  product: Product
  categories: Category[]
}) {
  // Find the initial category from the product's subcategory_id
  const initialCategory = categories.find((c) =>
    c.subcategories.some((s) => s.id === product.subcategory_id)
  )

  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description || '')
  const [material, setMaterial] = useState(product.material || '')
  const [baseCost, setBaseCost] = useState(product.base_cost?.toString() || '')
  const [published, setPublished] = useState(product.published)
  const [categoryId, setCategoryId] = useState(initialCategory?.id || '')
  const [subcategoryId, setSubcategoryId] = useState(product.subcategory_id || '')
  const [images, setImages] = useState<string[]>(product.images || [])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const selectedCategory = categories.find((c) => c.id === categoryId)
  const subcategories = selectedCategory?.subcategories || []

  const handleCategoryChange = (value: string) => {
    setCategoryId(value)
    setSubcategoryId('')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('products')
      .update({
        name,
        description: description || null,
        material: material || null,
        base_cost: baseCost ? parseFloat(baseCost) : null,
        published,
        subcategory_id: subcategoryId || null,
        images: images.length > 0 ? images : null,
      })
      .eq('id', product.id)

    if (error) {
      alert(error.message)
    } else {
      router.push('/admin/products')
      router.refresh()
    }

    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)

    const { error } = await supabase
      .from('products')
      .update({ archived: true })
      .eq('id', product.id)

    if (error) {
      alert(error.message)
      setDeleting(false)
    } else {
      router.push('/admin/products')
      router.refresh()
    }
  }

  const handleTogglePublish = async () => {
    const newValue = !published
    setPublished(newValue)

    const { error } = await supabase
      .from('products')
      .update({ published: newValue })
      .eq('id', product.id)

    if (error) {
      setPublished(!newValue)
      alert(error.message)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <button
          type="button"
          onClick={handleTogglePublish}
          className={`px-4 py-2 text-sm font-medium rounded border transition ${
            published
              ? 'border-green-700 bg-green-900/50 text-green-100 hover:bg-green-900'
              : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          }`}
        >
          {published ? 'Published' : 'Draft'} — Click to {published ? 'Unpublish' : 'Publish'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
              required
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Subcategory</label>
            <select
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
              required
              disabled={!categoryId}
            >
              <option value="">
                {categoryId ? 'Select subcategory' : 'Select a category first'}
              </option>
              {subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <ImageUpload images={images} onImagesChange={setImages} />
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Material</label>
          <input
            type="text"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Base Cost (€)</label>
          <input
            type="number"
            step="0.01"
            value={baseCost}
            onChange={(e) => setBaseCost(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-3 text-red-400 border border-red-900 rounded hover:bg-red-900/30 transition"
            >
              Delete
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-red-400">Are you sure?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </form>

      <VariantTable productId={product.id} productName={name} />
    </>
  )
}
