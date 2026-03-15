// ============================================================
// Product Hierarchy Constants
// Concept → Gender → Category → Product
//
// Hierarchy = "What it is" (locked at creation)
// Collection Type = "Why it exists" (can be changed)
// ============================================================

export const GENDERS = [
  { value: 'mens', label: 'Men' },
  { value: 'womens', label: 'Women' },
  { value: 'unisex', label: 'Unisex' },
] as const

export const GENDER_LABELS: Record<string, string> = {
  mens: 'Men',
  womens: 'Women',
  unisex: 'Unisex',
}

export const COLLECTION_TYPES = [
  { value: 'editorials', label: 'Editorials' },
  { value: 'signature', label: 'Signature' },
  { value: 'foundation', label: 'Foundation' },
  { value: 'special_projects', label: 'Special Projects' },
] as const

export const COLLECTION_TYPE_LABELS: Record<string, string> = {
  editorial: 'Editorial',
  editorials: 'Editorials',
  signature: 'Signature',
  foundation: 'Foundation',
  special_projects: 'Special Projects',
}

export const PRODUCT_CAPABILITIES = [
  { value: 'none', label: 'None' },
  { value: 'simple_customizable', label: 'Simple Customizable' },
  { value: 'quote_only', label: 'Quote Only' },
  { value: 'both', label: 'Both' },
] as const

export const STATUSES = [
  { value: 'development', label: 'Development' },
  { value: 'active', label: 'Active' },
] as const

// Categories per concept
// RTW: Ready-to-Wear garments
// Accessories: non-garment wearable products
// Objects: non-wearable products
export const RTW_CATEGORIES = [
  'Knitwear',
  'Leather',
  'Outerwear',
  'Suit Jackets',
  'Sweatshirts',
  'Swimwear',
  'Trousers',
  'T-shirts',
  'Shirts',
  'Shorts',
  'Skirts',
] as const

export const ACCESSORIES_CATEGORIES = [
  'Bags',
  'Shoes',
  'Hats',
  'Other accessories',
  'Socks',
] as const

export const OBJECTS_CATEGORIES = [
  'Other',
] as const

// Gender-category filtering for RTW
// Men: all RTW except Skirts
// Women: all RTW
// Unisex: all categories
const RTW_WOMEN_ONLY_CATEGORIES = new Set(['Skirts'])

// Fabric Construction (Knit / Woven / Neither)
export const FABRIC_CONSTRUCTIONS = [
  { value: 'knit', label: 'Knit' },
  { value: 'woven', label: 'Woven' },
  { value: 'neither', label: 'Neither' },
] as const

export const FABRIC_CONSTRUCTION_LABELS: Record<string, string> = {
  knit: 'Knit',
  woven: 'Woven',
  neither: 'Neither',
}

// Packaging Method
export const PACKAGING_METHODS = [
  { value: 'polybag', label: 'Polybag' },
  { value: 'box', label: 'Box' },
  { value: 'hanger', label: 'Hanger' },
  { value: 'tissue_wrap', label: 'Tissue Wrap' },
  { value: 'flat_pack', label: 'Flat Pack' },
  { value: 'roll_pack', label: 'Roll Pack' },
  { value: 'none', label: 'None' },
] as const

export const PACKAGING_METHOD_LABELS: Record<string, string> = {
  polybag: 'Polybag',
  box: 'Box',
  hanger: 'Hanger',
  tissue_wrap: 'Tissue Wrap',
  flat_pack: 'Flat Pack',
  roll_pack: 'Roll Pack',
  none: 'None',
}

// Production Country
export const PRODUCTION_COUNTRIES = [
  { value: 'CN', label: 'China' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'VN', label: 'Vietnam' },
  { value: 'IN', label: 'India' },
  { value: 'TR', label: 'Turkey' },
  { value: 'PT', label: 'Portugal' },
  { value: 'IT', label: 'Italy' },
  { value: 'ES', label: 'Spain' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'MM', label: 'Myanmar' },
  { value: 'KH', label: 'Cambodia' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'TH', label: 'Thailand' },
  { value: 'LK', label: 'Sri Lanka' },
  { value: 'MA', label: 'Morocco' },
  { value: 'TN', label: 'Tunisia' },
  { value: 'SE', label: 'Sweden' },
  { value: 'other', label: 'Other' },
] as const

export const PRODUCTION_COUNTRY_LABELS: Record<string, string> = Object.fromEntries(
  PRODUCTION_COUNTRIES.map((c) => [c.value, c.label])
)

export function getCategoriesForGender<T extends { id: string; name: string }>(
  conceptName: string,
  genderValue: string,
  allCategories: T[]
): T[] {
  const normalizedConcept = conceptName.toLowerCase()

  if (normalizedConcept.includes('rtw') || normalizedConcept.includes('ready')) {
    if (genderValue === 'mens') {
      return allCategories.filter((c) => !RTW_WOMEN_ONLY_CATEGORIES.has(c.name))
    }
  }

  // Women, Unisex, Accessories, Objects: show all categories under that concept
  return allCategories
}
