'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useKeyboardSave } from '@/lib/useKeyboardSave'
import Link from 'next/link'

interface Concept {
  id: string
  name: string
  slug: string
  display_order: number
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  display_order: number
}

export default function ConceptEditForm({
  concept,
  categories,
}: {
  concept: Concept
  categories: Category[]
}) {
  const [name, setName] = useState(concept.name)
  const [slug, setSlug] = useState(concept.slug)
  const [displayOrder, setDisplayOrder] = useState(concept.display_order.toString())
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useKeyboardSave(useCallback(() => {
    const form = document.querySelector('form')
    form?.requestSubmit()
  }, []))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('concepts')
      .update({
        name,
        slug,
        display_order: displayOrder ? parseInt(displayOrder) : 0,
      })
      .eq('id', concept.id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Changes saved")
      router.push("/admin/concepts")
      router.refresh()
    }

    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)

    const { error } = await supabase
      .from('concepts')
      .delete()
      .eq('id', concept.id)

    if (error) {
      toast.error(error.message)
      setDeleting(false)
    } else {
      toast.success("Concept deleted")
      router.push("/admin/concepts")
      router.refresh()
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Edit Concept</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Concept Name</label>
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
                {categories.length > 0
                  ? `This will also delete ${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}. Sure?`
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
          <h2 className="text-xl font-semibold">Categories</h2>
          <Link
            href={`/admin/concepts/${concept.id}/categories/new`}
            className="px-4 py-2 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition"
          >
            Add Category
          </Link>
        </div>

        {categories.length === 0 ? (
          <p className="text-neutral-500">No categories yet.</p>
        ) : (
          <div className="space-y-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/admin/categories/${cat.id}`}
                className="flex items-center justify-between border border-neutral-800 rounded-lg p-4 hover:border-neutral-600 transition block"
              >
                <div>
                  <span className="font-medium">{cat.name}</span>
                  <span className="ml-3 text-sm text-neutral-500">/{cat.slug}</span>
                </div>
                {cat.description && (
                  <span className="text-sm text-neutral-400">{cat.description}</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
