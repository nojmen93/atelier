'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Shirt,
  FileText,
  Truck,
  FolderTree,
  Image,
  LayoutGrid,
  Menu,
  X,
  LogOut,
} from 'lucide-react'

interface SubItem {
  label: string
  href: string
}

interface NavItem {
  label: string
  icon: React.ReactNode
  href: string
  subItems?: SubItem[]
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
    href: '/admin',
  },
  {
    label: 'Styles',
    icon: <Shirt className="w-5 h-5 shrink-0" />,
    href: '/admin/styles',
    subItems: [
      { label: 'New Style', href: '/admin/styles/new' },
      { label: 'All Styles', href: '/admin/styles' },
    ],
  },
  {
    label: 'Quotes',
    icon: <FileText className="w-5 h-5 shrink-0" />,
    href: '/admin/quotes',
    subItems: [
      { label: 'New Quote', href: '/admin/quotes/new' },
      { label: 'All Quotes', href: '/admin/quotes' },
    ],
  },
  {
    label: 'Suppliers',
    icon: <Truck className="w-5 h-5 shrink-0" />,
    href: '/admin/suppliers',
    subItems: [
      { label: 'New Supplier', href: '/admin/suppliers/new' },
      { label: 'All Suppliers', href: '/admin/suppliers' },
    ],
  },
  {
    label: 'Categories',
    icon: <FolderTree className="w-5 h-5 shrink-0" />,
    href: '/admin/concepts',
    subItems: [
      { label: 'Manage Categories', href: '/admin/concepts' },
    ],
  },
  {
    label: 'Logos',
    icon: <Image className="w-5 h-5 shrink-0" />,
    href: '/admin/logos',
    subItems: [
      { label: 'Upload Logo', href: '/admin/logos/new' },
      { label: 'Logo Library', href: '/admin/logos' },
    ],
  },
  {
    label: 'Views',
    icon: <LayoutGrid className="w-5 h-5 shrink-0" />,
    href: '/admin/views',
    subItems: [
      { label: 'New View', href: '/admin/views/new' },
      { label: 'All Views', href: '/admin/views' },
    ],
  },
]

function isActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin'
  return pathname.startsWith(href)
}

export default function Sidebar({ logoutAction }: { logoutAction: () => Promise<void> }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white md:hidden"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-neutral-950 border-r border-neutral-800/50
          transform transition-transform duration-300 ease-in-out md:hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-5 border-b border-neutral-800/50">
          <span className="text-sm font-semibold tracking-wider text-neutral-300 uppercase">Atelier</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-theme(spacing.16))]">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <div key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                    ${active
                      ? 'bg-neutral-800 text-white border-l-2 border-white -ml-px'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
                {item.subItems && (
                  <div className="ml-8 mt-0.5 space-y-0.5">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.href + sub.label}
                        href={sub.href}
                        onClick={() => setMobileOpen(false)}
                        className={`
                          block px-3 py-1.5 rounded-md text-xs transition-colors
                          ${pathname === sub.href
                            ? 'text-white bg-neutral-800/60'
                            : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/30'
                          }
                        `}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          <div className="pt-4 border-t border-neutral-800/50 mt-4">
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-500 hover:text-white hover:bg-neutral-800/50 transition-colors w-full"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </nav>
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="
          hidden md:flex fixed inset-y-0 left-0 z-40 flex-col
          w-[72px] hover:w-60
          bg-neutral-950 border-r border-neutral-800/50
          transition-all duration-300 ease-in-out
          group/sidebar
        "
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-5 border-b border-neutral-800/50 overflow-hidden">
          <span className="text-sm font-semibold tracking-wider text-neutral-300 uppercase whitespace-nowrap">
            <span className="inline group-hover/sidebar:hidden">A</span>
            <span className="hidden group-hover/sidebar:inline opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">Atelier</span>
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <div key={item.label} className="group/item">
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap
                    transition-all duration-200
                    ${active
                      ? 'bg-neutral-800 text-white border-l-2 border-white -ml-px shadow-lg shadow-neutral-400/10'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50 hover:shadow-lg hover:shadow-neutral-400/20'
                    }
                  `}
                >
                  {item.icon}
                  <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
                    {item.label}
                  </span>
                </Link>
                {item.subItems && (
                  <div className="ml-8 mt-0.5 space-y-0.5 hidden group-hover/sidebar:block">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.href + sub.label}
                        href={sub.href}
                        className={`
                          block px-3 py-1.5 rounded-md text-xs whitespace-nowrap
                          opacity-0 group-hover/sidebar:opacity-100 transition-all duration-200
                          ${pathname === sub.href
                            ? 'text-white bg-neutral-800/60'
                            : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/30'
                          }
                        `}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Sign out */}
        <div className="p-3 border-t border-neutral-800/50">
          <form action={logoutAction}>
            <button
              type="submit"
              className="
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm whitespace-nowrap
                text-neutral-500 hover:text-white hover:bg-neutral-800/50
                transition-all duration-200 w-full
              "
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
                Sign Out
              </span>
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
