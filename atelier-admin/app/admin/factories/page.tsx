import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function FactoriesPage() {
  const supabase = await createClient()

  const { data: factories } = await supabase
    .from('factories')
    .select('*')
    .order('name')

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Factories</h1>
        <Link
          href="/admin/factories/new"
          className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200"
        >
          New Factory
        </Link>
      </div>

      {(!factories || factories.length === 0) ? (
        <div className="border border-neutral-800 border-dashed rounded-lg p-16 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-5 text-neutral-600">
            <path d="M2 20a2 2 0 002 2h16a2 2 0 002-2V8l-7 5V8l-7 5V4a2 2 0 00-2-2H4a2 2 0 00-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-neutral-300 mb-2">No factories yet</h3>
          <p className="text-neutral-500 text-sm mb-6 max-w-sm mx-auto">Add production facilities to manage manufacturing capacity and locations.</p>
          <Link
            href="/admin/factories/new"
            className="inline-block px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
          >
            Add First Factory
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {factories.map((factory) => (
            <Link
              key={factory.id}
              href={`/admin/factories/${factory.id}`}
              className="block border border-neutral-800 rounded-lg p-6 hover:border-neutral-600 transition"
            >
              <h3 className="text-xl font-semibold mb-2">{factory.name}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-neutral-400">
                <div>
                  <span className="block text-neutral-500">Location</span>
                  {factory.city && factory.country
                    ? `${factory.city}, ${factory.country}`
                    : factory.country || factory.city || 'N/A'}
                </div>
                <div>
                  <span className="block text-neutral-500">MOQ</span>
                  {factory.moq || 'N/A'}
                </div>
                <div>
                  <span className="block text-neutral-500">Lead Time</span>
                  {factory.lead_time_days ? `${factory.lead_time_days} days` : 'N/A'}
                </div>
                <div>
                  <span className="block text-neutral-500">Contact</span>
                  {factory.contact_email || 'N/A'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
