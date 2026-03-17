import { getBuyer } from '@/lib/get-buyer'
import TopNav from '@/components/TopNav'

export default async function DashboardPage() {
  const { buyer } = await getBuyer()

  return (
    <div className="min-h-screen">
      <TopNav companyName={buyer.company_name} />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold">
          Welcome back, {buyer.contact_name}
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          {buyer.company_name}
        </p>
      </main>
    </div>
  )
}
