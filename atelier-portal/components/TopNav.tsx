'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function TopNav({ companyName }: { companyName?: string }) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/catalog', label: 'Catalog' },
    { href: '/orders', label: 'Orders' },
  ]

  return (
    <nav className="border-b border-neutral-800 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="text-sm font-semibold tracking-tight">Atelier</span>
        {companyName && (
          <span className="text-xs text-neutral-500 hidden sm:inline">{companyName}</span>
        )}
        <div className="flex items-center gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs transition ${
                pathname.startsWith(link.href)
                  ? 'text-foreground'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
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
