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
  PRODUCT_CAPABILITIES,
  STATUSES,
  FABRIC_CONSTRUCTIONS,
  PACKAGING_METHODS,
  PRODUCTION_COUNTRIES,
} from '@/lib/product-hierarchy'

const TABS = [
  { key: 'product', label: 'Properties' },
  { key: 'colourways', label: 'Colourways' },
  { key: 'sku', label: 'SKU' },
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

      {/* Properties Tab */}
      {activeTab === 'product' && (
        <form onSubmit={handleSave} className="space-y-4">

          {/* ── Identity & Hierarchy ── */}
          <div className="border border-neutral-800 rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Identity</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Product Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Product Code</label>
                <input type="text" value={baseStyleCode} onChange={(e) => setBaseStyleCode(e.target.value)} className={inputClass} placeholder="e.g. SH-SOF-01" />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Display Name</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputClass} placeholder="Customer-facing name" />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-3">
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
                <input type="text" value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className={inputClass} placeholder="Optional" />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Collection Type *</label>
                <select value={collectionType} onChange={(e) => setCollectionType(e.target.value)} className={inputClass} required>
                  {COLLECTION_TYPES.map((ct) => (
                    <option key={ct.value} value={ct.value}>{ct.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-6 pt-1">
              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="sr-only peer" />
                  <div className="w-8 h-4 bg-neutral-700 rounded-full peer peer-checked:bg-green-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4" />
                </label>
                <span className="text-xs text-neutral-300">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={showOnWebsite} onChange={(e) => setShowOnWebsite(e.target.checked)} className="sr-only peer" />
                  <div className="w-8 h-4 bg-neutral-700 rounded-full peer peer-checked:bg-green-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4" />
                </label>
                <span className="text-xs text-neutral-300">Show on Website</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-neutral-500">Capability</label>
                <select value={productCapability} onChange={(e) => setProductCapability(e.target.value)} className="px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-white text-xs focus:border-neutral-600 focus:outline-none">
                  {PRODUCT_CAPABILITIES.map((pc) => (
                    <option key={pc.value} value={pc.value}>{pc.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-neutral-500">RRP</label>
                <input type="number" step="0.01" value={rrpEur} onChange={(e) => setRrpEur(e.target.value)} className="w-24 px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-white text-xs focus:border-neutral-600 focus:outline-none" placeholder="EUR" />
              </div>
            </div>
          </div>

          {/* ── Specification (Materials & Construction) ── */}
          <div className="border border-neutral-800 rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Specification</h3>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Main Materials</label>
                <input type="text" value={material} onChange={(e) => setMaterial(e.target.value)} className={inputClass} placeholder="e.g. Organic Cotton" />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Composition</label>
                <input type="text" value={composition} onChange={(e) => setComposition(e.target.value)} className={inputClass} placeholder="e.g. 100% cotton" />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Fabric Construction</label>
                <select value={fabricConstruction} onChange={(e) => setFabricConstruction(e.target.value)} className={inputClass}>
                  <option value="">Select...</option>
                  {FABRIC_CONSTRUCTIONS.map((fc) => (
                    <option key={fc.value} value={fc.value}>{fc.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Packaging Method</label>
                <select value={packagingMethod} onChange={(e) => setPackagingMethod(e.target.value)} className={inputClass}>
                  <option value="">Select...</option>
                  {PACKAGING_METHODS.map((pm) => (
                    <option key={pm.value} value={pm.value}>{pm.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Content ── */}
          <div className="border border-neutral-800 rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Content</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputClass} placeholder="Short description" />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Extended Description</label>
                <textarea value={extendedDescription} onChange={(e) => setExtendedDescription(e.target.value)} rows={2} className={inputClass} placeholder="For PDFs/quotes" />
              </div>
            </div>
          </div>

          {/* ── Assets ── */}
          <div className="border border-neutral-800 rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Assets</h3>
            <ImageUpload images={images} onImagesChange={setImages} />
          </div>

          {/* ── Production & Costs ── */}
          <div className="border border-neutral-800 rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Production</h3>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Supplier</label>
                <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className={inputClass}>
                  <option value="">None</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Factory</label>
                <input type="text" value={productionFactory} onChange={(e) => setProductionFactory(e.target.value)} className={inputClass} placeholder="Factory name" />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Country</label>
                <select value={productionCountry} onChange={(e) => setProductionCountry(e.target.value)} className={inputClass}>
                  <option value="">Select...</option>
                  {PRODUCTION_COUNTRIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">City</label>
                <input type="text" value={productionCity} onChange={(e) => setProductionCity(e.target.value)} className={inputClass} placeholder="City" />
              </div>
            </div>
            <div className="grid grid-cols-6 gap-3">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Base Cost</label>
                <input type="number" step="0.01" value={baseCost} onChange={(e) => setBaseCost(e.target.value)} className={inputClass} placeholder="EUR" />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Landed Cost</label>
                <input type="number" step="0.01" value={landedCostEur} onChange={(e) => setLandedCostEur(e.target.value)} className={inputClass} placeholder="EUR" />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Lead Time</label>
                <input type="number" value={leadTimeDays} onChange={(e) => setLeadTimeDays(e.target.value)} className={inputClass} placeholder="days" />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">MID Number</label>
                <input type="text" value={midNumber} onChange={(e) => setMidNumber(e.target.value)} className={inputClass} placeholder="Mfr ID" />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Delivery Drop</label>
                <input type="text" value={deliveryDrop} onChange={(e) => setDeliveryDrop(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Customization</label>
                <input type="text" value={customizationMode} onChange={(e) => setCustomizationMode(e.target.value)} className={inputClass} placeholder="e.g. embroidery" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">EU HS Code</label>
                <input type="text" value={euHsCode} onChange={(e) => setEuHsCode(e.target.value)} className={inputClass} placeholder="HS code EU" />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">US HS Code</label>
                <input type="text" value={usHsCode} onChange={(e) => setUsHsCode(e.target.value)} className={inputClass} placeholder="HS code US" />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">HTS Lookup Ref</label>
                <input type="text" value={htsLookupRef} onChange={(e) => setHtsLookupRef(e.target.value)} className={inputClass} placeholder="HTS reference" />
              </div>
            </div>
          </div>

          {/* Variants Section */}
          <div className="pt-4 border-t border-neutral-800">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Variants</h3>
            <VariantTable styleId={style.id} styleName={name} />
          </div>

          {/* Customization Section */}
          <div className="pt-4 border-t border-neutral-800">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Customization</h3>
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
              className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded hover:bg-neutral-200 transition"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-red-400 text-sm border border-red-900 rounded hover:bg-red-900/30 transition"
              >
                Delete
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-red-400">Delete permanently?</span>
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

      {/* Supplier Quote Tab */}
      {activeTab === 'supplier_quote' && (
        <SupplierQuoteTab styleId={style.id} suppliers={suppliers} />
      )}
    </>
  )
}
