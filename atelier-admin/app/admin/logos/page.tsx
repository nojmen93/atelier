import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

function extractStoragePath(fileUrl: string): string | null {
  const marker = '/object/public/logos/'
  const idx = fileUrl.indexOf(marker)
  if (idx === -1) return null
  return fileUrl.slice(idx + marker.length)
}

export default async function LogosPage() {
  const supabase = await createClient()

  const { data: logos } = await supabase
    .from('logos')
    .select('*')
    .order('created_at', { ascending: false })

  // Generate signed URLs for all logos
  const signedUrls: Record<string, string> = {}
  if (logos) {
    for (const logo of logos) {
      const path = extractStoragePath(logo.file_url)
      if (path) {
        const { data } = await supabase.storage
          .from('logos')
          .createSignedUrl(path, 3600)
        if (data?.signedUrl) signedUrls[logo.id] = data.signedUrl
      }
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Logos</h1>
        <Link
          href="/admin/logos/new"
          className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
        >
          Upload New Logo
        </Link>
      </div>

      {(!logos || logos.length === 0) ? (
        <div className="border border-neutral-800 border-dashed rounded-lg p-16 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-5 text-neutral-600">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <h3 className="text-lg font-semibold text-neutral-300 mb-2">No logos uploaded</h3>
          <p className="text-neutral-500 text-sm mb-6 max-w-sm mx-auto">Upload client logos in SVG, AI, EPS, or PNG format for use in product customizations.</p>
          <Link
            href="/admin/logos/new"
            className="inline-block px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
          >
            Upload First Logo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {logos.map((logo) => (
            <Link
              key={logo.id}
              href={`/admin/logos/${logo.id}`}
              className="border border-neutral-800 rounded-lg overflow-hidden hover:border-neutral-600 transition group"
            >
              <div className="aspect-square bg-neutral-900 flex items-center justify-center p-6">
                {(logo.file_format === 'PNG' || logo.file_format === 'SVG') && signedUrls[logo.id] ? (
                  <img
                    src={signedUrls[logo.id]}
                    alt={logo.company_name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <span className="text-2xl font-bold text-neutral-600">{logo.file_format}</span>
                    <p className="text-xs text-neutral-700 mt-1">Preview not available</p>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm group-hover:text-neutral-300 transition truncate">{logo.company_name}</h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="px-2 py-0.5 text-xs bg-neutral-800 text-neutral-400 rounded">{logo.file_format}</span>
                  {logo.width && logo.height && (
                    <span className="text-xs text-neutral-600">{logo.width} x {logo.height}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
