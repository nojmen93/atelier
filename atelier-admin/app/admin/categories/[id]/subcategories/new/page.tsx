'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import BackLink from '@/components/BackLink'

export default function NewSubcategoryPage() {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [displayOrder, setDisplayOrder] = useState('')
  const [loading, setLoading] = useState(false)
  const [categoryName, setCategoryName] = useState('')
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const supabase = createClient()
  const categoryId = params.id

  useEffect(() => {
    supabase
      .from('categories')
      .select('name')
      .eq('id', categoryId)
      .single()
      .then(({ data }) => {
        if (data) setCategoryName(data.name)
      })
  }, [categoryId, supabase])

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('subcategories').insert({
      category_id: categoryId,
      name,
      slug,
      description: description || null,
      display_order: displayOrder ? parseInt(displayOrder) : 0,
    })

    if (error) {
      alert(error.message)
    } else {
      router.push(`/admin/categories/${categoryId}`)
    }

    setLoading(false)
  }

  return (
    <div className="max-w-2xl">
      <BackLink href={`/admin/categories/${categoryId}`} label="Back to Category" />
      <h1 className="text-3xl font-bold mb-2">New Subcategory</h1>
      {categoryName && (
        <p className="text-neutral-400 mb-8">Under: {categoryName}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Subcategory Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Display Order</label>
          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
            placeholder="0"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
        >
          {loading ? 'Creating...' : 'Create Subcategory'}
        </button>
      </form>
    </div>
  )
}
