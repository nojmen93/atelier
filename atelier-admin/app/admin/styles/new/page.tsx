'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import ImageUpload from '@/components/ImageUpload'
import BackLink from '@/components/BackLink'
import { useHierarchy } from '@/lib/hierarchy-context'
import {
  GENDERS,
  COLLECTION_TYPES,
  PRODUCT_CAPABILITIES,
  getCategoriesForGender,
} from '@/lib/product-hierarchy'

interface Concept {
  id: string
  name: string
  categories: { id: string; name: string; default_moq: number | null; default_supplier_id: string | null; default_lead_time_days: number | null }[]
}

interface Supplier {
  id: string
  name: string
}

export default function NewProductPage() {
  const hierarchy = useHierarchy()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [material, setMaterial] = useState('')
  const [baseCost, setBaseCost] = useState('')
  const [leadTimeDays, setLeadTimeDays] = useState('')
  const [conceptId, setConceptId] = useState(hierarchy.conceptId || '')
  const [gender, setGender] = useState(hierarchy.genderId || 'unisex')
  const [categoryId, setCategoryId] = useState(hierarchy.categoryId || '')
  const [supplierId, setSupplierId] = useState('')
  const [collectionType, setCollectionType] = useState('foundation')
  const [productCapability, setProductCapability] = useState('none')
  const [customizationMode, setCustomizationMode] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [concepts, setConcepts] = useState<Concept[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    Promise.all([
      supabase
        .from('concepts')
        .select('id, name, categories(id, name, default_moq, default_supplier_id, default_lead_time_days)')
        .order('display_order', { ascending: true }),
      supabase
        .from('suppliers')
        .select('id, name')
        .order('name'),
    ]).then(([conceptsRes, suppliersRes]) => {
      if (conceptsRes.data) setConcepts(conceptsRes.data)
      if (suppliersRes.data) setSuppliers(suppliersRes.data)
    })
  }, [supabase])

  const selectedConcept = concepts.find((c) => c.id === conceptId)
  const allCategories = selectedConcept?.categories || []
  const filteredCategories = selectedConcept && gender
    ? getCategoriesForGender(selectedConcept.name, gender, allCategories)
    : allCategories

  const handleConceptChange = (value: string) => {
    setConceptId(value)
    setGender('unisex')
    setCategoryId('')
  }

  const handleGenderChange = (value: string) => {
    setGender(value)
    setCategoryId('')
  }

  const handleCategoryChange = (value: string) => {
    setCategoryId(value)
    const cat = allCategories.find((c) => c.id === value)
    if (cat) {
      if (cat.default_supplier_id && !supplierId) setSupplierId(cat.default_supplier_id)
      if (cat.default_lead_time_days && !leadTimeDays) setLeadTimeDays(cat.default_lead_time_days.toString())
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('styles').insert({
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
      description: description || null,
      material: material || null,
      images: images.length > 0 ? images : null,
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Product created')
      router.push('/admin/styles')
    }

    setLoading(false)
  }

  const inputClass = 'w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none'

  return (
    <div className="max-w-2xl">
      <BackLink href="/admin/styles" label="Back to Products" />
      <h1 className="text-3xl font-bold mb-8">New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        {/* Hierarchy: Concept > Gender > Category (locked after creation) */}
        <div className="border border-neutral-800 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-medium text-neutral-300">Product Hierarchy</h3>
            <span className="text-xs text-neutral-600">(cannot be changed after creation)</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Concept</label>
              <select
                value={conceptId}
                onChange={(e) => handleConceptChange(e.target.value)}
                className={inputClass}
                required
              >
                <option value="">Select concept</option>
                {concepts.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Gender</label>
              <select
                value={gender}
                onChange={(e) => handleGenderChange(e.target.value)}
                className={inputClass}
                required
                disabled={!conceptId}
              >
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Category</label>
              <select
                value={categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className={inputClass}
                required
                disabled={!conceptId}
              >
                <option value="">
                  {conceptId ? 'Select category' : 'Select concept first'}
                </option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Collection Type (separate from hierarchy — can be changed later) */}
        <div>
          <label className="block text-sm font-medium mb-2">Collection Type</label>
          <select
            value={collectionType}
            onChange={(e) => setCollectionType(e.target.value)}
            className={inputClass}
            required
          >
            {COLLECTION_TYPES.map((ct) => (
              <option key={ct.value} value={ct.value}>{ct.label}</option>
            ))}
          </select>
          <p className="text-xs text-neutral-500 mt-1">Strategic attribute — can be changed after creation</p>
        </div>

        {/* Product Capability */}
        <div>
          <label className="block text-sm font-medium mb-2">Product Capability</label>
          <select
            value={productCapability}
            onChange={(e) => setProductCapability(e.target.value)}
            className={inputClass}
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
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Material</label>
          <input
            type="text"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Supplier + Cost + Lead Time */}
        <div>
          <label className="block text-sm font-medium mb-2">Base Supplier</label>
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className={inputClass}
          >
            <option value="">None</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Base Cost (&euro;)</label>
            <input
              type="number"
              step="0.01"
              value={baseCost}
              onChange={(e) => setBaseCost(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Lead Time (days)</label>
            <input
              type="number"
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Customization Mode</label>
          <input
            type="text"
            value={customizationMode}
            onChange={(e) => setCustomizationMode(e.target.value)}
            className={inputClass}
            placeholder="e.g. logo placement, embroidery"
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
