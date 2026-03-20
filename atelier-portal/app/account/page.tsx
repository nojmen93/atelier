import { getBuyer } from '@/lib/get-buyer'
import { getPendingOrderCount } from '@/lib/get-pending-order-count'
import TopNav from '@/components/TopNav'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Account' }

export default async function AccountPage() {
  const { buyer } = await getBuyer()
  const pendingOrderCount = await getPendingOrderCount(buyer.id)

  const fields = [
    { label: 'Company', value: buyer.company_name },
    { label: 'Contact name', value: buyer.contact_name },
    { label: 'Email', value: buyer.email ?? '—' },
    {
      label: 'Account created',
      value: buyer.created_at
        ? new Date(buyer.created_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : '—',
    },
  ]

  return (
    <div className="min-h-screen">
      <TopNav companyName={buyer.company_name} pendingOrderCount={pendingOrderCount} />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-xl font-semibold mb-8">Account</h1>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 divide-y divide-neutral-800">
          {fields.map((field) => (
            <div key={field.label} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <span className="text-xs text-neutral-500 uppercase tracking-wider">
                {field.label}
              </span>
              <span className="text-sm text-foreground">{field.value}</span>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-neutral-500 text-center">
          Need to update your details? Contact your Atelier representative.
        </p>
      </main>
    </div>
  )
}
