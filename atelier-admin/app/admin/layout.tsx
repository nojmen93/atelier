import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { HierarchyProvider } from '@/lib/hierarchy-context'

async function logoutAction() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

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
    <HierarchyProvider>
      <div className="min-h-screen bg-black text-white flex">
        <Sidebar logoutAction={logoutAction} />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </HierarchyProvider>
  )
}
