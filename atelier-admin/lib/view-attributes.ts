// All available attributes for Style views
export interface AttributeDefinition {
  key: string
  label: string
  type: 'text' | 'number' | 'enum' | 'relation' | 'images' | 'date' | 'computed'
  filterable?: boolean
  sortable?: boolean
  groupable?: boolean
  enumValues?: { value: string; label: string }[]
}

export const STYLE_ATTRIBUTES: AttributeDefinition[] = [
  { key: 'name', label: 'Style Name', type: 'text', filterable: true, sortable: true },
  { key: 'description', label: 'Description', type: 'text' },
  { key: 'material', label: 'Material', type: 'text', filterable: true, sortable: true },
  {
    key: 'gender', label: 'Gender', type: 'enum', filterable: true, sortable: true, groupable: true,
    enumValues: [
      { value: 'mens', label: "Men's" },
      { value: 'womens', label: "Women's" },
      { value: 'unisex', label: 'Unisex' },
      { value: 'na', label: 'N/A' },
    ],
  },
  {
    key: 'collection_type', label: 'Collection Type', type: 'enum', filterable: true, sortable: true, groupable: true,
    enumValues: [
      { value: 'editorial', label: 'Editorial' },
      { value: 'signature', label: 'Signature' },
      { value: 'foundation', label: 'Foundation' },
      { value: 'special_projects', label: 'Special Projects' },
    ],
  },
  {
    key: 'product_capability', label: 'Product Capability', type: 'enum', filterable: true, groupable: true,
    enumValues: [
      { value: 'none', label: 'None' },
      { value: 'simple_customizable', label: 'Simple Customizable' },
      { value: 'quote_only', label: 'Quote Only' },
      { value: 'both', label: 'Both' },
    ],
  },
  {
    key: 'status', label: 'Status', type: 'enum', filterable: true, sortable: true, groupable: true,
    enumValues: [
      { value: 'active', label: 'Active' },
      { value: 'development', label: 'Development' },
      { value: 'archived', label: 'Archived' },
    ],
  },
  { key: 'base_cost', label: 'Base Cost (€)', type: 'number', sortable: true },
  { key: 'lead_time_days', label: 'Lead Time (days)', type: 'number', sortable: true },
  { key: 'customization_mode', label: 'Customization Mode', type: 'text' },
  { key: 'display_order', label: 'Sort Order', type: 'number', sortable: true },
  { key: 'concept_name', label: 'Concept', type: 'relation', filterable: true, sortable: true, groupable: true },
  { key: 'category_name', label: 'Category', type: 'relation', filterable: true, sortable: true, groupable: true },
  { key: 'supplier_name', label: 'Supplier', type: 'relation', filterable: true, sortable: true, groupable: true },
  { key: 'variant_count', label: 'Variants', type: 'computed', sortable: true },
  { key: 'images', label: 'Images', type: 'images' },
  { key: 'created_at', label: 'Created', type: 'date', sortable: true },
  { key: 'updated_at', label: 'Updated', type: 'date', sortable: true },
]

export const GENDER_LABELS: Record<string, string> = {
  mens: "Men's", womens: "Women's", unisex: 'Unisex', na: 'N/A',
}

export const COLLECTION_LABELS: Record<string, string> = {
  editorial: 'Editorial', signature: 'Signature', foundation: 'Foundation', special_projects: 'Special Projects',
}

export const STATUS_LABELS: Record<string, string> = {
  active: 'Active', development: 'Development', archived: 'Archived',
}

export const CAPABILITY_LABELS: Record<string, string> = {
  none: 'None', simple_customizable: 'Simple Customizable', quote_only: 'Quote Only', both: 'Both',
}

export interface ViewConfig {
  id?: string
  name: string
  type: 'grid' | 'gallery'
  entity: string
  selected_attributes: string[]
  filters: ViewFilter[]
  sort: ViewSort[]
  group_by: string[]
  display_options: DisplayOptions
  export_options: ExportOptions
  is_default: boolean
}

export interface ViewFilter {
  field: string
  operator: 'eq' | 'neq' | 'contains' | 'gt' | 'lt'
  value: string
}

export interface ViewSort {
  field: string
  direction: 'asc' | 'desc'
}

export interface DisplayOptions {
  items_per_row: number
  image_size: 'small' | 'medium' | 'large'
  card_attributes: string[]
  show_pagination: boolean
  items_per_page: number
}

export interface ExportOptions {
  header_text: string
  page_size: 'a4' | 'letter'
  include_images: boolean
  include_header: boolean
}

export function mapRowToViewConfig(view: Record<string, unknown>): ViewConfig {
  return {
    id: view.id as string,
    name: view.name as string,
    type: view.type as ViewConfig['type'],
    entity: view.entity as string,
    selected_attributes: (view.selected_attributes as string[]) || [],
    filters: (view.filters as ViewConfig['filters']) || [],
    sort: (view.sort as ViewConfig['sort']) || [],
    group_by: (view.group_by as string[]) || [],
    display_options: (view.display_options as ViewConfig['display_options']) || {
      items_per_row: 3,
      image_size: 'medium',
      card_attributes: [],
      show_pagination: true,
      items_per_page: 24,
    },
    export_options: (view.export_options as ViewConfig['export_options']) || {
      header_text: '',
      page_size: 'a4',
      include_images: true,
      include_header: true,
    },
    is_default: view.is_default as boolean,
  }
}

export const DEFAULT_VIEW_CONFIG: ViewConfig = {
  name: '',
  type: 'gallery',
  entity: 'styles',
  selected_attributes: ['name', 'images', 'gender', 'collection_type', 'category_name', 'status'],
  filters: [],
  sort: [{ field: 'display_order', direction: 'asc' }],
  group_by: [],
  display_options: {
    items_per_row: 3,
    image_size: 'medium',
    card_attributes: ['gender', 'collection_type', 'category_name'],
    show_pagination: true,
    items_per_page: 24,
  },
  export_options: {
    header_text: '',
    page_size: 'a4',
    include_images: true,
    include_header: true,
  },
  is_default: false,
}
