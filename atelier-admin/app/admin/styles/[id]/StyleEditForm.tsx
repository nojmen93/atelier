'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/components/ImageUpload'
import VariantTable from '@/components/VariantTable'

const GENDERS = [
  { value: 'mens', label: "Men's" },
  { value: 'womens', label: "Women's" },
  { value: 'unisex', label: 'Unisex' },
  { value: 'na', label: 'N/A' },
]

const COLLECTION_TYPES = [
  { value: 'editorial', label: 'Editorial' },
  { value: 'signature', label: 'Signature' },
  { value: 'foundation', label: 'Foundation' },
  { value: 'special_projects', label: 'Special Projects' },
]

const PRODUCT_CAPABILITIES = [
  { value: 'none', label: 'None' },
  { value: 'simple_customizable', label: 'Simple Customizable' },
  { value: 'quote_only', label: 'Quote Only' },
  { value: 'both', label: 'Both' },
]

const STATUSES = [
  { value: 'development', label: 'Development' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
]

interface Style {
  id: string
  name: string
  concept_id: string
  gender: string
  category_id: string
  supplier_id: string | null
  base_cost: number | null
  lead_time_days: number | null
  customization_mode: string | null
  collection_type: string
  product_capability: string
  status: string
  description: string | null
  material: string | null
  images: string[] | null
}

interface Concept {
  id: string
  name: string
  categories: { id: string; name: string; default_moq: number | null; default_supplier_id: string | null; default_lead_time_days: number | null }[]
}

interface Supplier {
  id: string
  name: string
}

export default function StyleEditForm({
  style,
  concepts,
  suppliers,
}: {
  style: Style
  concepts: Concept[]
  suppliers: Supplier[]
}) {
  const [name, setName] = useState(style.name)
  const [description, setDescription] = useState(style.description || '')
  const [material, setMaterial] = useState(style.material || '')
  const [baseCost, setBaseCost] = useState(style.base_cost?.toString() || '')
  const [leadTimeDays, setLeadTimeDays] = useState(style.lead_time_days?.toString() || '')
  const [conceptId, setConceptId] = useState(style.concept_id)
  const [categoryId, setCategoryId] = useState(style.category_id)
  const [supplierId, setSupplierId] = useState(style.supplier_id || '')
  const [gender, setGender] = useState(style.gender)
  const [collectionType, setCollectionType] = useState(style.collection_type)
  const [productCapability, setProductCapability] = useState(style.product_capability)
  const [status, setStatus] = useState(style.status)
  const [customizationMode, setCustomizationMode] = useState(style.customization_mode || '')
  const [images, setImages] = useState<string[]>(style.images || [])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const selectedConcept = concepts.find((c) => c.id === conceptId)
  const categories = selectedConcept?.categories || []

  const handleConceptChange = (value: string) => {
    setConceptId(value)
    setCategoryId('')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('styles')
      .update({
        name,
        concept_id: conceptId,
        gender,
        category_id: categoryId,
        supplier_id: supplierId || null,
        base_cost: baseCost ? parseFloat(baseCost) : null,
        lead_time_days: leadTimeDays ? parseInt(leadTimeDays) : null,
        customization_mode: customizationMode || null,
        collection_type: collectionType,
        product_capability: productCapability,
        status,
        description: description || null,
        material: material || null,
        images: images.length > 0 ? images : null,
      })
      .eq('id', style.id)

    if (error) {
      alert(error.message)
    } else {
      router.push('/admin/styles')
      router.refresh()
    }

    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)

    const { error } = await supabase
      .from('styles')
      .update({ status: 'archived' })
      .eq('id', style.id)

    if (error) {
      alert(error.message)
      setDeleting(false)
    } else {
      router.push('/admin/styles')
      router.refresh()
    }
  }

  const statusColor = {
    active: 'border-green-700 bg-green-900/50 text-green-100',
    development: 'border-yellow-700 bg-yellow-900/50 text-yellow-100',
    archived: 'border-red-700 bg-red-900/50 text-red-100',
  }[status] || 'border-neutral-700 bg-neutral-800 text-neutral-300'

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Edit Style</h1>
        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`px-4 py-2 text-sm font-medium rounded border transition ${statusColor}`}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Style Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
            required
          />
        </div>

        {/* Hierarchy: Concept > Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Concept</label>
            <select
              value={conceptId}
              onChange={(e) => handleConceptChange(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
              required
            >
              <option value="">Select concept</option>
              {concepts.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
              required
              disabled={!conceptId}
            >
              <option value="">
                {conceptId ? 'Select category' : 'Select a concept first'}
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Gender + Collection Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
              required
            >
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Collection Type</label>
            <select
              value={collectionType}
              onChange={(e) => setCollectionType(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
              required
            >
              {COLLECTION_TYPES.map((ct) => (
                <option key={ct.value} value={ct.value}>{ct.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Capability */}
        <div>
          <label className="block text-sm font-medium mb-2">Product Capability</label>
          <select
            value={productCapability}
            onChange={(e) => setProductCapability(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
            required
          >
            {PRODUCT_CAPABILITIES.map((pc) => (
              <option key={pc.value} value={pc.value}>{pc.label}</option>
            ))}
          </select>
          <p className="text-xs text-neutral-500 mt-1">Controls frontend checkout and customization behavior</p>
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

        {/* Supplier + Cost + Lead Time */}
        <div>
          <label className="block text-sm font-medium mb-2">Base Supplier</label>
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
          >
            <option value="">None</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
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
          <div>
            <label className="block text-sm font-medium mb-2">Lead Time (days)</label>
            <input
              type="number"
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Customization Mode</label>
          <input
            type="text"
            value={customizationMode}
            onChange={(e) => setCustomizationMode(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none"
            placeholder="e.g. logo placement, embroidery"
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
              Archive
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-red-400">Archive this style?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
              >
                {deleting ? 'Archiving...' : 'Yes, Archive'}
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

      <VariantTable styleId={style.id} styleName={name} />
    </>
  )
}
