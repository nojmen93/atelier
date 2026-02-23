'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  display_order: number
}

interface Subcategory {
  id: string
  name: string
  slug: string
  description: string | null
  display_order: number
}

export default function CategoryEditForm({
  category,
  subcategories,
}: {
  category: Category
  subcategories: Subcategory[]
}) {
  const [name, setName] = useState(category.name)
  const [slug, setSlug] = useState(category.slug)
  const [description, setDescription] = useState(category.description || '')
  const [displayOrder, setDisplayOrder] = useState(category.display_order.toString())
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('categories')
      .update({
        name,
        slug,
        description: description || null,
        display_order: displayOrder ? parseInt(displayOrder) : 0,
      })
      .eq('id', category.id)

    if (error) {
      alert(error.message)
    } else {
      router.push('/admin/categories')
      router.refresh()
    }

    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', category.id)

    if (error) {
      alert(error.message)
      setDeleting(false)
    } else {
      router.push('/admin/categories')
      router.refresh()
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Edit Category</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Category Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
              <span className="text-sm text-red-400">
                {subcategories.length > 0
                  ? `This will also delete ${subcategories.length} subcategor${subcategories.length === 1 ? 'y' : 'ies'}. Sure?`
                  : 'Are you sure?'}
              </span>
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

      <div className="mt-12 pt-8 border-t border-neutral-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Subcategories</h2>
          <Link
            href={`/admin/categories/${category.id}/subcategories/new`}
            className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition"
          >
            Add Subcategory
          </Link>
        </div>

        {subcategories.length === 0 ? (
          <p className="text-neutral-500">No subcategories yet.</p>
        ) : (
          <div className="space-y-3">
            {subcategories.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between border border-neutral-800 rounded-lg p-4"
              >
                <div>
                  <span className="font-medium">{sub.name}</span>
                  <span className="ml-3 text-sm text-neutral-500">/{sub.slug}</span>
                </div>
                {sub.description && (
                  <span className="text-sm text-neutral-400">{sub.description}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
