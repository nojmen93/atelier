'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/components/ImageUpload'

interface Category {
  id: string
  name: string
  subcategories: { id: string; name: string }[]
}

export default function NewProductPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [material, setMaterial] = useState('')
  const [baseCost, setBaseCost] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [subcategoryId, setSubcategoryId] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('categories')
      .select('id, name, subcategories(id, name)')
      .order('display_order', { ascending: true })
      .then(({ data }) => {
        if (data) setCategories(data)
      })
  }, [supabase])

  const selectedCategory = categories.find((c) => c.id === categoryId)
  const subcategories = selectedCategory?.subcategories || []

  const handleCategoryChange = (value: string) => {
    setCategoryId(value)
    setSubcategoryId('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('products').insert({
      name,
      description: description || null,
      material: material || null,
      base_cost: baseCost ? parseFloat(baseCost) : null,
      subcategory_id: subcategoryId,
      images: images.length > 0 ? images : null,
    })

    if (error) {
      alert(error.message)
    } else {
      router.push('/admin/products')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
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
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
        >
          {loading ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </div>
  )
}
