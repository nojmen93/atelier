import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BackLink from '@/components/BackLink'
import LogoDetailForm from './LogoDetailForm'

export default async function LogoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: logo } = await supabase
    .from('logos')
    .select('*')
    .eq('id', id)
    .single()

  if (!logo) {
    notFound()
  }

  return (
    <div className="max-w-2xl">
      <BackLink href="/admin/logos" label="Back to Logos" />
      <LogoDetailForm logo={logo} />
    </div>
  )
}
