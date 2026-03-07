import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BackLink from '@/components/BackLink'
import LogoDetailForm from './LogoDetailForm'

function extractStoragePath(fileUrl: string): string | null {
  const marker = '/object/public/logos/'
  const idx = fileUrl.indexOf(marker)
  if (idx === -1) return null
  return fileUrl.slice(idx + marker.length)
}

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

  // Generate a signed URL for the private logos bucket
  let signedUrl: string | null = null
  const storagePath = extractStoragePath(logo.file_url)
  if (storagePath) {
    const { data } = await supabase.storage
      .from('logos')
      .createSignedUrl(storagePath, 3600)
    signedUrl = data?.signedUrl ?? null
  }

  return (
    <div className="max-w-2xl">
      <BackLink href="/admin/logos" label="Back to Logos" />
      <LogoDetailForm logo={logo} signedUrl={signedUrl} />
    </div>
  )
}
