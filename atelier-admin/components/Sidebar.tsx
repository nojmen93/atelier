'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface NavItem {
  label: string
  href: string
}

interface NavSection {
  label: string
  icon: React.ReactNode
  href?: string
  items: NavItem[]
}

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`transition-transform ${open ? 'rotate-90' : ''}`}
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
)

const sections: NavSection[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
    items: [],
  },
  {
    label: 'Product',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46L16 2 12 3.46 8 2 3.62 3.46a2 2 0 00-1.34 1.89v13.3a2 2 0 001.34 1.89L8 22l4-1.46L16 22l4.38-1.46a2 2 0 001.34-1.89V5.35a2 2 0 00-1.34-1.89z" />
        <line x1="12" y1="22" x2="12" y2="3.46" />
      </svg>
    ),
    items: [
      { label: 'Hierarchy', href: '/admin/styles/hierarchy' },
      { label: 'Product', href: '/admin/styles' },
      { label: 'Colour Library', href: '/admin/styles/colours' },
      { label: 'Specification', href: '/admin/styles/specification' },
    ],
  },
  {
    label: 'Production',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20a2 2 0 002 2h16a2 2 0 002-2V8l-7 5V8l-7 5V4a2 2 0 00-2-2H4a2 2 0 00-2 2z" />
      </svg>
    ),
    items: [
      { label: 'Quote Requests', href: '/admin/quotes' },
      { label: 'Orders', href: '/admin/orders' },
      { label: 'Suppliers', href: '/admin/suppliers' },
      { label: 'Factories', href: '/admin/factories' },
    ],
  },
  {
    label: 'Logos',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    items: [
      { label: 'Logo Library', href: '/admin/logos' },
      { label: 'Upload Logo', href: '/admin/logos/new' },
      { label: 'Mockup Generator', href: '/admin/mockup' },
    ],
  },
  {
    label: 'Views',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    items: [
      { label: 'All Views', href: '/admin/views' },
      { label: 'New View', href: '/admin/views/new' },
    ],
  },
]

export default function Sidebar({ logoutAction }: { logoutAction?: () => Promise<void> }) {
  const pathname = usePathname()

  // Determine which sections should be open based on current path
  const getInitialOpen = () => {
    const open: Record<string, boolean> = {}
    for (const section of sections) {
      if (section.items.length === 0) continue
      const isActive = section.items.some(
        (item) => pathname === item.href || pathname.startsWith(item.href + '/')
      )
      open[section.label] = isActive
    }
    return open
  }

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(getInitialOpen)

  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside className="w-56 border-r border-neutral-800 bg-black flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-neutral-800">
        <Link href="/admin" className="text-lg font-bold tracking-tight">
          Atelier
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {sections.map((section) => {
          // Simple link (no sub-items) — e.g., Dashboard
          if (section.items.length === 0 && section.href) {
            return (
              <Link
                key={section.label}
                href={section.href}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm transition ${
                  isActive(section.href)
                    ? 'text-white bg-neutral-900'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
                }`}
              >
                {section.icon}
                {section.label}
              </Link>
            )
          }

          // Collapsible section
          const sectionOpen = openSections[section.label] ?? false
          const sectionActive = section.items.some((item) => isActive(item.href))

          return (
            <div key={section.label}>
              <button
                onClick={() => toggleSection(section.label)}
                className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition ${
                  sectionActive
                    ? 'text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {section.icon}
                <span className="flex-1 text-left">{section.label}</span>
                <ChevronIcon open={sectionOpen} />
              </button>

              {sectionOpen && (
                <div className="ml-5 pl-5 border-l border-neutral-800">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block py-1.5 text-sm transition ${
                        isActive(item.href)
                          ? 'text-white'
                          : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="border-t border-neutral-800 px-5 py-3 space-y-2">
        <Link
          href="/admin/settings"
          className={`flex items-center gap-3 text-sm transition ${
            isActive('/admin/settings')
              ? 'text-white'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
          Settings
        </Link>
        {logoutAction && (
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-3 text-sm text-neutral-500 hover:text-white transition w-full"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </form>
        )}
      </div>
    </aside>
  )
}
