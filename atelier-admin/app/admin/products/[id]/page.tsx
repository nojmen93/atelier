import { redirect } from 'next/navigation'

// Products have been replaced by Styles
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/admin/styles/${id}`)
}
