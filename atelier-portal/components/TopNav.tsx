'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function TopNav({ companyName }: { companyName?: string }) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="border-b border-neutral-800 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold tracking-tight">Atelier</span>
        {companyName && (
          <span className="text-xs text-neutral-500">{companyName}</span>
        )}
      </div>
      <button
        onClick={handleLogout}
        className="text-xs text-neutral-400 hover:text-foreground transition"
      >
        Log out
      </button>
    </nav>
  )
}
