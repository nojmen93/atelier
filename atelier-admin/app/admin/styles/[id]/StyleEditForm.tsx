'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useKeyboardSave } from '@/lib/useKeyboardSave'
import ImageUpload from '@/components/ImageUpload'
import VariantTable from '@/components/VariantTable'
import CustomizationTab from '@/components/CustomizationTab'
import ColourwaysTab from '@/components/ColourwaysTab'
import SKUTab from '@/components/SKUTab'
import SupplierQuoteTab from '@/components/SupplierQuoteTab'
import {
  GENDER_LABELS,
  COLLECTION_TYPES,
  COLLECTION_TYPE_LABELS,
  PRODUCT_CAPABILITIES,
  STATUSES,
} from '@/lib/product-hierarchy'

const TABS = [
  { key: 'product', label: 'Product' },
  { key: 'colourways', label: 'Colourways' },
  { key: 'sku', label: 'SKU' },
  { key: 'specification', label: 'Specification' },
  { key: 'supplier_quote', label: 'Supplier Quote' },
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

export interface Logo {
  id: string
  company_name: string
  file_url: string
  file_format: string
}

export default function StyleEditForm({
  style,
  concepts,
  suppliers,
  logos,
}: {
  style: Style
  concepts: Concept[]
  suppliers: Supplier[]
  logos: Logo[]
}) {
  const [activeTab, setActiveTab] = useState('product')
  const [name, setName] = useState(style.name)
  const [description, setDescription] = useState(style.description || '')
  const [material, setMaterial] = useState(style.material || '')
  const [baseCost, setBaseCost] = useState(style.base_cost?.toString() || '')
  const [leadTimeDays, setLeadTimeDays] = useState(style.lead_time_days?.toString() || '')
  const [supplierId, setSupplierId] = useState(style.supplier_id || '')
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

  // Resolve hierarchy names for read-only display
  const conceptName = concepts.find((c) => c.id === style.concept_id)?.name || '—'
  const categoryName = concepts
    .find((c) => c.id === style.concept_id)
    ?.categories.find((cat) => cat.id === style.category_id)?.name || '—'
  const genderLabel = GENDER_LABELS[style.gender] || style.gender
  const supplierName = suppliers.find((s) => s.id === supplierId)?.name || '—'

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('styles')
      .update({
        name,
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
      toast.error(error.message)
    } else {
      toast.success('Changes saved')
      router.push('/admin/styles')
      router.refresh()
    }

    setSaving(false)
  }

  const handleKeyboardSave = useCallback(() => {
    if (activeTab === 'product') {
      const form = document.querySelector('form')
      form?.requestSubmit()
    }
  }, [activeTab])

  useKeyboardSave(handleKeyboardSave)

  const handleDelete = async () => {
    setDeleting(true)

    const { error } = await supabase
      .from('styles')
      .update({ status: 'archived' })
      .eq('id', style.id)

    if (error) {
      toast.error(error.message)
      setDeleting(false)
    } else {
      toast.success('Product archived')
      router.push('/admin/styles')
      router.refresh()
    }
  }

  const statusColor = {
    active: 'border-green-700 bg-green-900/50 text-green-100',
    development: 'border-yellow-700 bg-yellow-900/50 text-yellow-100',
    archived: 'border-red-700 bg-red-900/50 text-red-100',
  }[status] || 'border-neutral-700 bg-neutral-800 text-neutral-300'

  const inputClass = 'w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded text-white focus:border-neutral-600 focus:outline-none'

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Edit Product</h1>
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

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-8 border-b border-neutral-800">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition -mb-px ${
              activeTab === tab.key
                ? 'border-white text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Product Tab */}
      {activeTab === 'product' && (
        <form onSubmit={handleSave} className="space-y-6">
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

          {/* Hierarchy: Read-only display */}
          <div className="border border-neutral-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-medium text-neutral-300">Product Hierarchy</h3>
              <span className="text-xs text-neutral-600">(set at creation, read-only)</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="block text-xs text-neutral-500 mb-1">Concept</span>
                <span className="text-sm text-white">{conceptName}</span>
              </div>
              <div>
                <span className="block text-xs text-neutral-500 mb-1">Gender</span>
                <span className="text-sm text-white">{genderLabel}</span>
              </div>
              <div>
                <span className="block text-xs text-neutral-500 mb-1">Category</span>
                <span className="text-sm text-white">{categoryName}</span>
              </div>
            </div>
          </div>

          {/* Collection Type (editable — separate from hierarchy) */}
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
            <p className="text-xs text-neutral-500 mt-1">Strategic attribute — determines why this product exists</p>
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

          {/* Variants Section */}
          <div className="pt-6 border-t border-neutral-800">
            <h3 className="text-sm font-medium text-neutral-300 mb-4">Variants</h3>
            <VariantTable styleId={style.id} styleName={name} />
          </div>

          {/* Customization Section */}
          <div className="pt-6 border-t border-neutral-800">
            <h3 className="text-sm font-medium text-neutral-300 mb-4">Customization</h3>
            <CustomizationTab
              styleId={style.id}
              images={images}
              logos={logos}
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
                <span className="text-sm text-red-400">Archive this product?</span>
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
      )}

      {/* Colourways Tab */}
      {activeTab === 'colourways' && (
        <ColourwaysTab styleId={style.id} />
      )}

      {/* SKU Tab */}
      {activeTab === 'sku' && (
        <SKUTab styleId={style.id} styleName={name} />
      )}

      {/* Specification Tab */}
      {activeTab === 'specification' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Product Specification</h2>
          <div className="border border-neutral-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-neutral-800">
                  <td className="px-4 py-3 text-neutral-500 font-medium w-48">Product Name</td>
                  <td className="px-4 py-3 text-white">{name}</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-4 py-3 text-neutral-500 font-medium">Concept</td>
                  <td className="px-4 py-3 text-white">{conceptName}</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-4 py-3 text-neutral-500 font-medium">Gender</td>
                  <td className="px-4 py-3 text-white">{genderLabel}</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-4 py-3 text-neutral-500 font-medium">Category</td>
                  <td className="px-4 py-3 text-white">{categoryName}</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-4 py-3 text-neutral-500 font-medium">Collection Type</td>
                  <td className="px-4 py-3 text-white">
                    {COLLECTION_TYPES.find((ct) => ct.value === collectionType)?.label || collectionType}
                  </td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-4 py-3 text-neutral-500 font-medium">Material</td>
                  <td className="px-4 py-3 text-white">{material || '—'}</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-4 py-3 text-neutral-500 font-medium">Description</td>
                  <td className="px-4 py-3 text-white whitespace-pre-wrap">{description || '—'}</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-4 py-3 text-neutral-500 font-medium">Base Supplier</td>
                  <td className="px-4 py-3 text-white">{supplierName}</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-4 py-3 text-neutral-500 font-medium">Base Cost</td>
                  <td className="px-4 py-3 text-white font-mono">
                    {baseCost ? `€${parseFloat(baseCost).toFixed(2)}` : '—'}
                  </td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-4 py-3 text-neutral-500 font-medium">Lead Time</td>
                  <td className="px-4 py-3 text-white">
                    {leadTimeDays ? `${leadTimeDays} days` : '—'}
                  </td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-4 py-3 text-neutral-500 font-medium">Customization Mode</td>
                  <td className="px-4 py-3 text-white">{customizationMode || '—'}</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-4 py-3 text-neutral-500 font-medium">Product Capability</td>
                  <td className="px-4 py-3 text-white">
                    {PRODUCT_CAPABILITIES.find((pc) => pc.value === productCapability)?.label || productCapability}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-neutral-500 font-medium">Status</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded border ${statusColor}`}>
                      {STATUSES.find((s) => s.value === status)?.label || status}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Supplier Quote Tab */}
      {activeTab === 'supplier_quote' && (
        <SupplierQuoteTab styleId={style.id} suppliers={suppliers} />
      )}
    </>
  )
}
