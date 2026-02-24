import { redirect } from 'next/navigation'

// Products have been replaced by Styles
export default function ProductsPage() {
  redirect('/admin/styles')
}
