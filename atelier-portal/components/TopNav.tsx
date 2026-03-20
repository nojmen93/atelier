'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function TopNav({
  companyName,
  pendingOrderCount: initialCount = 0,
}: {
  companyName?: string
  pendingOrderCount?: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(initialCount)

  useEffect(() => {
    setPendingCount(initialCount)
  }, [initialCount])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/catalog', label: 'Catalog' },
    { href: '/orders', label: 'Orders', badge: pendingCount },
    { href: '/account', label: 'Account' },
  ]

  return (
    <nav className="border-b border-neutral-800 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold tracking-tight">Atelier</span>
          {companyName && (
            <span className="text-xs text-neutral-500 hidden sm:inline">{companyName}</span>
          )}
          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs transition relative ${
                    isActive
                      ? 'text-foreground font-medium'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {link.label}
                  {link.badge != null && link.badge > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-medium rounded-full bg-blue-600 text-white">
                      {link.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="text-xs text-neutral-400 hover:text-foreground transition hidden sm:block"
          >
            Log out
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden flex flex-col justify-center items-center w-6 h-6 gap-1"
            aria-label="Toggle menu"
          >
            <span className={`block w-4 h-px bg-neutral-400 transition-all ${menuOpen ? 'rotate-45 translate-y-[3px]' : ''}`} />
            <span className={`block w-4 h-px bg-neutral-400 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-4 h-px bg-neutral-400 transition-all ${menuOpen ? '-rotate-45 -translate-y-[3px]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden mt-3 pt-3 border-t border-neutral-800 flex flex-col gap-3 pb-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`text-sm transition ${
                  isActive
                    ? 'text-foreground font-medium'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {link.label}
                {link.badge != null && link.badge > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-medium rounded-full bg-blue-600 text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            )
          })}
          <button
            onClick={handleLogout}
            className="text-sm text-neutral-400 hover:text-foreground transition text-left"
          >
            Log out
          </button>
        </div>
      )}
    </nav>
  )
}
