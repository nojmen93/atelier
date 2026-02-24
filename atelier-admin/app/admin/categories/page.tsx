import { redirect } from 'next/navigation'

// Categories are now managed under Concepts
export default function CategoriesPage() {
  redirect('/admin/concepts')
}
