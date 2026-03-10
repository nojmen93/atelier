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
  FABRIC_CONSTRUCTIONS,
  PACKAGING_METHODS,
  PRODUCTION_COUNTRIES,
  PRODUCTION_COUNTRY_LABELS,
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
  // New PLM attributes
  base_style_code: string | null
  sub_category: string | null
  display_name: string | null
  active: boolean
  show_on_website: boolean
  rrp_eur: number | null
  extended_description: string | null
  composition: string | null
  fabric_construction: string | null
  packaging_method: string | null
  production_factory: string | null
  production_country: string | null
  production_city: string | null
  mid_number: string | null
  delivery_drop: string | null
  eu_hs_code: string | null
  us_hs_code: string | null
  hts_lookup_ref: string | null
  landed_cost_eur: number | null
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
  // New PLM attributes
  const [baseStyleCode, setBaseStyleCode] = useState(style.base_style_code || '')
  const [subCategory, setSubCategory] = useState(style.sub_category || '')
  const [displayName, setDisplayName] = useState(style.display_name || '')
  const [active, setActive] = useState(style.active ?? true)
  const [showOnWebsite, setShowOnWebsite] = useState(style.show_on_website ?? false)
  const [rrpEur, setRrpEur] = useState(style.rrp_eur?.toString() || '')
  const [extendedDescription, setExtendedDescription] = useState(style.extended_description || '')
  const [composition, setComposition] = useState(style.composition || '')
  const [fabricConstruction, setFabricConstruction] = useState(style.fabric_construction || '')
  const [packagingMethod, setPackagingMethod] = useState(style.packaging_method || '')
  const [productionFactory, setProductionFactory] = useState(style.production_factory || '')
  const [productionCountry, setProductionCountry] = useState(style.production_country || '')
  const [productionCity, setProductionCity] = useState(style.production_city || '')
  const [midNumber, setMidNumber] = useState(style.mid_number || '')
  const [deliveryDrop, setDeliveryDrop] = useState(style.delivery_drop || '')
  const [euHsCode, setEuHsCode] = useState(style.eu_hs_code || '')
  const [usHsCode, setUsHsCode] = useState(style.us_hs_code || '')
  const [htsLookupRef, setHtsLookupRef] = useState(style.hts_lookup_ref || '')
  const [landedCostEur, setLandedCostEur] = useState(style.landed_cost_eur?.toString() || '')
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
        // New PLM attributes
        base_style_code: baseStyleCode || null,
        sub_category: subCategory || null,
        display_name: displayName || null,
        active,
        show_on_website: showOnWebsite,
        rrp_eur: rrpEur ? parseFloat(rrpEur) : null,
        extended_description: extendedDescription || null,
        composition: composition || null,
        fabric_construction: fabricConstruction || null,
        packaging_method: packagingMethod || null,
        production_factory: productionFactory || null,
        production_country: productionCountry || null,
        production_city: productionCity || null,
        mid_number: midNumber || null,
        delivery_drop: deliveryDrop || null,
        eu_hs_code: euHsCode || null,
        us_hs_code: usHsCode || null,
        hts_lookup_ref: htsLookupRef || null,
        landed_cost_eur: landedCostEur ? parseFloat(landedCostEur) : null,
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
      .delete()
      .eq('id', style.id)

    if (error) {
      toast.error(error.message)
      setDeleting(false)
    } else {
      toast.success('Product deleted')
      router.push('/admin/styles')
      router.refresh()
    }
  }

  const statusColor = {
    active: 'border-green-700 bg-green-900/50 text-green-100',
    development: 'border-yellow-700 bg-yellow-900/50 text-yellow-100',
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

          {/* ── Section: Product (Base) ── */}
          <div className="border border-neutral-800 rounded-lg p-5 space-y-4">
            <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">Product (Base)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Product Code</label>
                <input type="text" value={baseStyleCode} onChange={(e) => setBaseStyleCode(e.target.value)} className={inputClass} placeholder="e.g. SH-SOF-01" />
                <p className="text-xs text-neutral-600 mt-1">Stable internal code</p>
              </div>
            </div>
            <div>
              <span className="block text-xs text-neutral-500 mb-1">Unique ID</span>
              <span className="text-sm text-neutral-400 font-mono">{style.id}</span>
            </div>
          </div>

          {/* ── Section: Hierarchy ── */}
          <div className="border border-neutral-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">Hierarchy</h3>
              <span className="text-xs text-neutral-600">(set at creation, read-only)</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
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
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Sub Category</label>
                <input type="text" value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className={inputClass} placeholder="Optional finer grouping" />
              </div>
            </div>
          </div>

          {/* ── Section: Commercial ── */}
          <div className="border border-neutral-800 rounded-lg p-5 space-y-4">
            <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">Commercial</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Collection Type *</label>
                <select value={collectionType} onChange={(e) => setCollectionType(e.target.value)} className={inputClass} required>
                  {COLLECTION_TYPES.map((ct) => (
                    <option key={ct.value} value={ct.value}>{ct.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Display Name</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputClass} placeholder="Customer-facing name on portal/website" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-3 py-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="sr-only peer" />
                  <div className="w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:bg-green-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                </label>
                <span className="text-sm text-neutral-300">Active</span>
              </div>
              <div className="flex items-center gap-3 py-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={showOnWebsite} onChange={(e) => setShowOnWebsite(e.target.checked)} className="sr-only peer" />
                  <div className="w-9 h-5 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:bg-green-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                </label>
                <span className="text-sm text-neutral-300">Show on Website</span>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">RRP (EUR)</label>
                <input type="number" step="0.01" value={rrpEur} onChange={(e) => setRrpEur(e.target.value)} className={inputClass} placeholder="0.00" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Product Capability</label>
              <select value={productCapability} onChange={(e) => setProductCapability(e.target.value)} className={inputClass} required>
                {PRODUCT_CAPABILITIES.map((pc) => (
                  <option key={pc.value} value={pc.value}>{pc.label}</option>
                ))}
              </select>
              <p className="text-xs text-neutral-500 mt-1">Controls frontend checkout and customization behavior</p>
            </div>
          </div>

          {/* ── Section: Content ── */}
          <div className="border border-neutral-800 rounded-lg p-5 space-y-4">
            <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">Content</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} placeholder="Short description of garment" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Extended Description</label>
              <textarea value={extendedDescription} onChange={(e) => setExtendedDescription(e.target.value)} rows={4} className={inputClass} placeholder="Longer description for PDFs/quotes" />
            </div>
          </div>

          {/* ── Section: Assets ── */}
          <div className="border border-neutral-800 rounded-lg p-5 space-y-4">
            <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">Assets</h3>
            <ImageUpload images={images} onImagesChange={setImages} />
          </div>

          {/* ── Section: Production ── */}
          <div className="border border-neutral-800 rounded-lg p-5 space-y-4">
            <h3 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">Production</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Production Supplier</label>
                <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className={inputClass}>
                  <option value="">None</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Production Factory</label>
                <input type="text" value={productionFactory} onChange={(e) => setProductionFactory(e.target.value)} className={inputClass} placeholder="Factory name" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Production Country</label>
                <select value={productionCountry} onChange={(e) => setProductionCountry(e.target.value)} className={inputClass}>
                  <option value="">Select country...</option>
                  {PRODUCTION_COUNTRIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Production City</label>
                <input type="text" value={productionCity} onChange={(e) => setProductionCity(e.target.value)} className={inputClass} placeholder="City" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">MID Number</label>
                <input type="text" value={midNumber} onChange={(e) => setMidNumber(e.target.value)} className={inputClass} placeholder="Manufacturer ID (US)" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Delivery Drop</label>
                <input type="text" value={deliveryDrop} onChange={(e) => setDeliveryDrop(e.target.value)} className={inputClass} placeholder="Internal delivery/drop" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">EU Harmonized Code</label>
                <input type="text" value={euHsCode} onChange={(e) => setEuHsCode(e.target.value)} className={inputClass} placeholder="HS code for EU" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">US Harmonized Code</label>
                <input type="text" value={usHsCode} onChange={(e) => setUsHsCode(e.target.value)} className={inputClass} placeholder="HS code for US" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">HTS Lookup Ref</label>
                <input type="text" value={htsLookupRef} onChange={(e) => setHtsLookupRef(e.target.value)} className={inputClass} placeholder="HTS reference" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Base Cost (&euro;)</label>
                <input type="number" step="0.01" value={baseCost} onChange={(e) => setBaseCost(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Landed Cost (EUR)</label>
                <input type="number" step="0.01" value={landedCostEur} onChange={(e) => setLandedCostEur(e.target.value)} className={inputClass} placeholder="Baseline landed cost" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Lead Time (days)</label>
                <input type="number" value={leadTimeDays} onChange={(e) => setLeadTimeDays(e.target.value)} className={inputClass} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Customization Mode</label>
            <input type="text" value={customizationMode} onChange={(e) => setCustomizationMode(e.target.value)} className={inputClass} placeholder="e.g. logo placement, embroidery" />
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
                Delete
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-red-400">Delete this product permanently?</span>
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
          <p className="text-xs text-neutral-500">Materials, composition, and construction details for this product.</p>

          {/* Editable specification fields */}
          <div className="border border-neutral-800 rounded-lg p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Main Materials</label>
              <input type="text" value={material} onChange={(e) => setMaterial(e.target.value)} className={inputClass} placeholder="e.g. Organic Cotton, Recycled Polyester" />
              <p className="text-xs text-neutral-600 mt-1">Links to materials master data</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Composition</label>
              <input type="text" value={composition} onChange={(e) => setComposition(e.target.value)} className={inputClass} placeholder="e.g. 100% cotton, 60% cotton / 40% polyester" />
              <p className="text-xs text-neutral-600 mt-1">Fiber composition for labeling</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Knit / Woven / Neither</label>
                <select value={fabricConstruction} onChange={(e) => setFabricConstruction(e.target.value)} className={inputClass}>
                  <option value="">Select...</option>
                  {FABRIC_CONSTRUCTIONS.map((fc) => (
                    <option key={fc.value} value={fc.value}>{fc.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Packaging Method</label>
                <select value={packagingMethod} onChange={(e) => setPackagingMethod(e.target.value)} className={inputClass}>
                  <option value="">Select...</option>
                  {PACKAGING_METHODS.map((pm) => (
                    <option key={pm.value} value={pm.value}>{pm.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Read-only summary of all key product data */}
          <h3 className="text-sm font-semibold text-neutral-400 pt-2">Full Product Summary</h3>
          <div className="border border-neutral-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-neutral-800">
                  <td className="px-4 py-3 text-neutral-500 font-medium w-48">Product Name</td>
                  <td className="px-4 py-3 text-white">{name}</td>
                </tr>
                {baseStyleCode && (
                  <tr className="border-b border-neutral-800">
                    <td className="px-4 py-3 text-neutral-500 font-medium">Product Code</td>
                    <td className="px-4 py-3 text-white font-mono">{baseStyleCode}</td>
                  </tr>
                )}
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
                  <td className="px-4 py-3 text-white">{categoryName}{subCategory ? ` / ${subCategory}` : ''}</td>
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
                  <td className="px-4 py-3 text-neutral-500 font-medium">Composition</td>
                  <td className="px-4 py-3 text-white">{composition || '—'}</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-4 py-3 text-neutral-500 font-medium">Fabric Construction</td>
                  <td className="px-4 py-3 text-white">
                    {FABRIC_CONSTRUCTIONS.find((fc) => fc.value === fabricConstruction)?.label || fabricConstruction || '—'}
                  </td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-4 py-3 text-neutral-500 font-medium">Packaging Method</td>
                  <td className="px-4 py-3 text-white">
                    {PACKAGING_METHODS.find((pm) => pm.value === packagingMethod)?.label || packagingMethod || '—'}
                  </td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-4 py-3 text-neutral-500 font-medium">Production Supplier</td>
                  <td className="px-4 py-3 text-white">{supplierName}</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-4 py-3 text-neutral-500 font-medium">Production Country</td>
                  <td className="px-4 py-3 text-white">{PRODUCTION_COUNTRY_LABELS[productionCountry] || productionCountry || '—'}</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-4 py-3 text-neutral-500 font-medium">Base Cost</td>
                  <td className="px-4 py-3 text-white font-mono">
                    {baseCost ? `€${parseFloat(baseCost).toFixed(2)}` : '—'}
                  </td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-4 py-3 text-neutral-500 font-medium">Landed Cost (EUR)</td>
                  <td className="px-4 py-3 text-white font-mono">
                    {landedCostEur ? `€${parseFloat(landedCostEur).toFixed(2)}` : '—'}
                  </td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="px-4 py-3 text-neutral-500 font-medium">Lead Time</td>
                  <td className="px-4 py-3 text-white">
                    {leadTimeDays ? `${leadTimeDays} days` : '—'}
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

          {/* Save button for specification changes */}
          <button
            type="button"
            onClick={(e) => handleSave(e as unknown as React.FormEvent)}
            disabled={saving}
            className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Supplier Quote Tab */}
      {activeTab === 'supplier_quote' && (
        <SupplierQuoteTab styleId={style.id} suppliers={suppliers} />
      )}
    </>
  )
}
