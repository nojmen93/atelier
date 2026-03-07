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
  { value: 'archived', label: 'Archived' },
] as const

// Categories per concept
// RTW: Ready-to-Wear garments
// Accessories and Objects: non-garment products
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
  '5-pocket denim',
] as const

export const ACCESSORIES_CATEGORIES = [
  'Bags',
  'SLG',
  'Scarves',
  'Shoes',
  'Hats',
  'Eyewear',
  'Jewellery',
  'Other accessories',
  'Socks',
] as const

// Gender-category filtering for RTW
// Men: all RTW except Skirts
// Women: all RTW
// Unisex: all categories
const RTW_WOMEN_ONLY_CATEGORIES = new Set(['Skirts'])

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

  // Women, Unisex, and Accessories: show all categories under that concept
  return allCategories
}
