'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  concept_id: string
  name: string
  slug: string
  description: string | null
  display_order: number
  default_moq: number | null
  default_supplier_id: string | null
  default_lead_time_days: number | null
  default_margin_rule: string | null
  technique_compatibility: string[] | null
}

interface Supplier {
  id: string
  name: string
}

export default function CategoryEditForm({
  category,
  conceptName,
  suppliers,
}: {
  category: Category
  conceptName: string
  suppliers: Supplier[]
}) {
  const [name, setName] = useState(category.name)
  const [slug, setSlug] = useState(category.slug)
  const [description, setDescription] = useState(category.description || '')
  const [displayOrder, setDisplayOrder] = useState(category.display_order.toString())
  const [defaultMoq, setDefaultMoq] = useState(category.default_moq?.toString() || '')
  const [defaultSupplierId, setDefaultSupplierId] = useState(category.default_supplier_id || '')
  const [defaultLeadTime, setDefaultLeadTime] = useState(category.default_lead_time_days?.toString() || '')
  const [defaultMarginRule, setDefaultMarginRule] = useState(category.default_margin_rule || '')
  const [techniqueCompat, setTechniqueCompat] = useState(
    (category.technique_compatibility || []).join(', ')
  )
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const techniques = techniqueCompat
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const { error } = await supabase
      .from('categories')
      .update({
        name,
        slug,
        description: description || null,
        display_order: displayOrder ? parseInt(displayOrder) : 0,
        default_moq: defaultMoq ? parseInt(defaultMoq) : null,
        default_supplier_id: defaultSupplierId || null,
        default_lead_time_days: defaultLeadTime ? parseInt(defaultLeadTime) : null,
        default_margin_rule: defaultMarginRule || null,
        technique_compatibility: techniques.length > 0 ? techniques : null,
      })
      .eq('id', category.id)

    if (error) {
      alert(error.message)
    } else {
      router.push(`/admin/concepts/${category.concept_id}`)
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
      router.push(`/admin/concepts/${category.concept_id}`)
      router.refresh()
    }
  }

  return (
    <>
      <p className="text-neutral-400 text-sm mb-2">Concept: {conceptName}</p>
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

        {/* Inheritance Defaults */}
        <div className="pt-6 border-t border-neutral-800">
          <h2 className="text-lg font-semibold mb-1">Inheritance Defaults</h2>
          <p className="text-sm text-neutral-500 mb-6">
            Styles in this category will inherit these values unless overridden.
          </p>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Default MOQ</label>
                <input
                  type="number"
                  value={defaultMoq}
                  onChange={(e) => setDefaultMoq(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
                  placeholder="Inherited by styles"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Default Lead Time (days)</label>
                <input
                  type="number"
                  value={defaultLeadTime}
                  onChange={(e) => setDefaultLeadTime(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
                  placeholder="Inherited by styles"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Default Supplier</label>
              <select
                value={defaultSupplierId}
                onChange={(e) => setDefaultSupplierId(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
              >
                <option value="">None</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Default Margin Rule</label>
              <input
                type="text"
                value={defaultMarginRule}
                onChange={(e) => setDefaultMarginRule(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
                placeholder="e.g. standard, premium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Technique Compatibility</label>
              <input
                type="text"
                value={techniqueCompat}
                onChange={(e) => setTechniqueCompat(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
                placeholder="Comma-separated, e.g. embroidery, screen print, heat transfer"
              />
              <p className="text-xs text-neutral-500 mt-1">Separate multiple techniques with commas</p>
            </div>
          </div>
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
    </>
  )
}
