import { redirect } from 'next/navigation'

// Categories are now created under Concepts
export default function NewCategoryPage() {
  redirect('/admin/concepts')
}
