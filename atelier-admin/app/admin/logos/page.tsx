import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function LogosPage() {
  const supabase = await createClient()

  const { data: logos } = await supabase
    .from('logos')
    .select('*')
    .order('created_at', { ascending: false })

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
        <div className="border border-neutral-800 rounded-lg p-12 text-center">
          <p className="text-neutral-400 mb-2">No logos yet.</p>
          <p className="text-neutral-500 text-sm">Upload your first logo to get started.</p>
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
                {logo.file_format === 'PNG' || logo.file_format === 'SVG' ? (
                  <img
                    src={logo.file_url}
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
