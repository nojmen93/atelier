import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-neutral-800 px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Atelier Admin</h1>
          <div className="flex gap-6">
            <a href="/admin" className="hover:text-neutral-400">Dashboard</a>
            <a href="/admin/styles" className="hover:text-neutral-400">Styles</a>
            <a href="/admin/concepts" className="hover:text-neutral-400">Concepts</a>
            <a href="/admin/suppliers" className="hover:text-neutral-400">Suppliers</a>
          </div>
        </div>
      </nav>
      <main className="p-8">{children}</main>
    </div>
  )
}
