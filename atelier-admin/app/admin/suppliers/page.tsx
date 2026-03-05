import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function SuppliersPage() {
  const supabase = await createClient()

  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('*')
    .order('name')

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Suppliers</h1>
        <Link
          href="/admin/suppliers/new"
          className="px-6 py-3 bg-white text-black font-medium rounded"
        >
          New Supplier
        </Link>
      </div>

      {(!suppliers || suppliers.length === 0) ? (
        <div className="border border-neutral-800 border-dashed rounded-lg p-16 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-5 text-neutral-600">
            <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
          <h3 className="text-lg font-semibold text-neutral-300 mb-2">No suppliers yet</h3>
          <p className="text-neutral-500 text-sm mb-6 max-w-sm mx-auto">Add your production partners and manufacturers to manage lead times, MOQs, and contacts.</p>
          <Link
            href="/admin/suppliers/new"
            className="inline-block px-6 py-3 bg-white text-black font-medium rounded hover:bg-neutral-200 transition"
          >
            Add First Supplier
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {suppliers.map((supplier) => (
            <Link
              key={supplier.id}
              href={`/admin/suppliers/${supplier.id}`}
              className="block border border-neutral-800 rounded-lg p-6 hover:border-neutral-600 transition"
            >
              <h3 className="text-xl font-semibold mb-2">{supplier.name}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-neutral-400">
                <div>
                  <span className="block text-neutral-500">MOQ</span>
                  {supplier.moq || 'N/A'}
                </div>
                <div>
                  <span className="block text-neutral-500">Lead Time</span>
                  {supplier.lead_time_days ? `${supplier.lead_time_days} days` : 'N/A'}
                </div>
                <div>
                  <span className="block text-neutral-500">Location</span>
                  {supplier.production_location || 'N/A'}
                </div>
                <div>
                  <span className="block text-neutral-500">Contact</span>
                  {supplier.contact_email || 'N/A'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
