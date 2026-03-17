import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'

export default async function AccessPendingPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Double-check: if buyer exists, redirect to dashboard
  const { data: buyer } = await supabase
    .from('buyers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (buyer) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-xl font-semibold">Access pending</h1>
        <p className="text-sm text-neutral-400">
          Your account has been authenticated, but you don&apos;t have buyer access yet.
          Contact your Atelier representative to get started.
        </p>
        <div className="pt-4">
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}
