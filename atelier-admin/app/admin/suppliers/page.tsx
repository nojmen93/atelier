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

      <div className="space-y-4">
        {suppliers?.map((supplier) => (
          <div
            key={supplier.id}
            className="block border border-neutral-800 rounded-lg p-6"
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
          </div>
        ))}
      </div>
    </div>
  )
}
