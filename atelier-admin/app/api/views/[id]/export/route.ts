import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { mapRowToViewConfig, STYLE_ATTRIBUTES } from '@/lib/view-attributes'

interface StyleRow {
  id: string
  name: string
  description: string | null
  material: string | null
  gender: string
  collection_type: string
  product_capability: string
  status: string
  base_cost: number | null
  lead_time_days: number | null
  customization_mode: string | null
  display_order: number
  images: string[] | null
  created_at: string
  updated_at: string
  base_style_code: string | null
  sub_category: string | null
  display_name: string | null
  active: boolean | null
  show_on_website: boolean | null
  rrp_eur: number | null
  composition: string | null
  fabric_construction: string | null
  packaging_method: string | null
  production_factory: string | null
  production_country: string | null
  production_city: string | null
  mid_number: string | null
  eu_hs_code: string | null
  us_hs_code: string | null
  hts_lookup_ref: string | null
  landed_cost_eur: number | null
  concepts: { name: string } | null
  categories: { name: string } | null
  suppliers: { name: string } | null
  variants: { id: string }[]
}

const GENDER_LABELS: Record<string, string> = {
  mens: "Men's", womens: "Women's", unisex: 'Unisex', na: 'N/A',
}

const COLLECTION_LABELS: Record<string, string> = {
  editorial: 'Editorial', signature: 'Signature', foundation: 'Foundation', special_projects: 'Special Projects',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active', development: 'Development',
}

const CAPABILITY_LABELS: Record<string, string> = {
  none: 'None', simple_customizable: 'Simple Customizable', quote_only: 'Quote Only', both: 'Both',
}

const COUNTRY_LABELS: Record<string, string> = {
  CN: 'China', BD: 'Bangladesh', VN: 'Vietnam', IN: 'India',
  TR: 'Turkey', PT: 'Portugal', IT: 'Italy', ES: 'Spain',
  SE: 'Sweden', other: 'Other',
}

const FABRIC_LABELS: Record<string, string> = {
  knit: 'Knit', woven: 'Woven', neither: 'Neither',
}

const PACKAGING_LABELS: Record<string, string> = {
  polybag: 'Polybag', box: 'Box', hanger: 'Hanger',
  tissue_wrap: 'Tissue Wrap', flat_pack: 'Flat Pack',
  roll_pack: 'Roll Pack', none: 'None',
}

function formatValue(key: string, style: StyleRow): string {
  switch (key) {
    case 'name': return style.name
    case 'description': return style.description || ''
    case 'material': return style.material || ''
    case 'gender': return GENDER_LABELS[style.gender] || style.gender
    case 'collection_type': return COLLECTION_LABELS[style.collection_type] || style.collection_type
    case 'product_capability': return CAPABILITY_LABELS[style.product_capability] || style.product_capability
    case 'status': return STATUS_LABELS[style.status] || style.status
    case 'base_cost': return style.base_cost != null ? `€${Number(style.base_cost).toFixed(2)}` : ''
    case 'lead_time_days': return style.lead_time_days != null ? `${style.lead_time_days}d` : ''
    case 'customization_mode': return style.customization_mode || ''
    case 'display_order': return style.display_order.toString()
    case 'concept_name': return style.concepts?.name || ''
    case 'category_name': return style.categories?.name || ''
    case 'supplier_name': return style.suppliers?.name || ''
    case 'variant_count': return style.variants?.length?.toString() || '0'
    case 'images': return style.images ? `${style.images.length} image(s)` : '0'
    case 'base_style_code': return style.base_style_code || ''
    case 'sub_category': return style.sub_category || ''
    case 'display_name': return style.display_name || ''
    case 'active': return style.active === true ? 'Active' : style.active === false ? 'Inactive' : ''
    case 'show_on_website': return style.show_on_website === true ? 'Yes' : style.show_on_website === false ? 'No' : ''
    case 'rrp_eur': return style.rrp_eur != null ? `€${Number(style.rrp_eur).toFixed(2)}` : ''
    case 'composition': return style.composition || ''
    case 'fabric_construction': return FABRIC_LABELS[style.fabric_construction || ''] || style.fabric_construction || ''
    case 'packaging_method': return PACKAGING_LABELS[style.packaging_method || ''] || style.packaging_method || ''
    case 'production_factory': return style.production_factory || ''
    case 'production_country': return COUNTRY_LABELS[style.production_country || ''] || style.production_country || ''
    case 'production_city': return style.production_city || ''
    case 'mid_number': return style.mid_number || ''
    case 'eu_hs_code': return style.eu_hs_code || ''
    case 'us_hs_code': return style.us_hs_code || ''
    case 'hts_lookup_ref': return style.hts_lookup_ref || ''
    case 'landed_cost_eur': return style.landed_cost_eur != null ? `€${Number(style.landed_cost_eur).toFixed(2)}` : ''
    case 'created_at': return new Date(style.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    case 'updated_at': return new Date(style.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    default: return ''
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const idsParam = searchParams.get('ids')

  const supabase = await createClient()

  const { data: view, error: viewError } = await supabase
    .from('views')
    .select('*')
    .eq('id', id)
    .single()

  if (viewError || !view) {
    return NextResponse.json({ error: 'View not found' }, { status: 404 })
  }

  const config = mapRowToViewConfig(view)

  let query = supabase
    .from('styles')
    .select('*, concepts(name), categories(name), suppliers(name), variants(id)')

  if (idsParam) {
    const ids = idsParam.split(',').filter(Boolean)
    if (ids.length > 0) {
      query = query.in('id', ids)
    }
  }

  for (const f of config.filters) {
    if (f.field === 'concept_name' || f.field === 'category_name' || f.field === 'supplier_name') {
      continue
    }
    if (f.operator === 'eq') query = query.eq(f.field, f.value)
    else if (f.operator === 'neq') query = query.neq(f.field, f.value)
    else if (f.operator === 'contains') query = query.ilike(f.field, `%${f.value}%`)
    else if (f.operator === 'gt') query = query.gt(f.field, f.value)
    else if (f.operator === 'lt') query = query.lt(f.field, f.value)
  }

  if (config.sort.length > 0) {
    for (const s of config.sort) {
      if (s.field === 'concept_name' || s.field === 'category_name' || s.field === 'supplier_name' || s.field === 'variant_count') {
        continue
      }
      query = query.order(s.field, { ascending: s.direction === 'asc' })
    }
  } else {
    query = query.order('display_order', { ascending: true })
  }

  const { data: styles, error: stylesError } = await query

  if (stylesError) {
    return NextResponse.json({ error: stylesError.message }, { status: 500 })
  }

  let filteredStyles = (styles || []) as StyleRow[]

  for (const f of config.filters) {
    if (f.field === 'concept_name') {
      filteredStyles = filteredStyles.filter(s =>
        f.operator === 'eq' ? s.concepts?.name === f.value
        : f.operator === 'neq' ? s.concepts?.name !== f.value
        : f.operator === 'contains' ? s.concepts?.name?.toLowerCase().includes(f.value.toLowerCase()) ?? false
        : true
      )
    } else if (f.field === 'category_name') {
      filteredStyles = filteredStyles.filter(s =>
        f.operator === 'eq' ? s.categories?.name === f.value
        : f.operator === 'neq' ? s.categories?.name !== f.value
        : f.operator === 'contains' ? s.categories?.name?.toLowerCase().includes(f.value.toLowerCase()) ?? false
        : true
      )
    } else if (f.field === 'supplier_name') {
      filteredStyles = filteredStyles.filter(s =>
        f.operator === 'eq' ? s.suppliers?.name === f.value
        : f.operator === 'neq' ? s.suppliers?.name !== f.value
        : f.operator === 'contains' ? s.suppliers?.name?.toLowerCase().includes(f.value.toLowerCase()) ?? false
        : true
      )
    }
  }

  const selectedAttrs = config.selected_attributes.filter(a => a !== 'images')
  const headers = selectedAttrs.map(key => {
    const attr = STYLE_ATTRIBUTES.find(a => a.key === key)
    return attr?.label || key
  })

  const rows = filteredStyles.map(style =>
    selectedAttrs.map(key => formatValue(key, style))
  )

  return NextResponse.json({
    viewName: config.name,
    headers,
    rows,
    exportOptions: config.export_options,
  })
}
