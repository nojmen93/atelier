import { redirect } from 'next/navigation'

// Subcategories have been replaced by the Concept > Category hierarchy
export default function NewSubcategoryPage() {
  redirect('/admin/concepts')
}
