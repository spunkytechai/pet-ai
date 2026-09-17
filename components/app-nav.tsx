'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/logout-button'

const links = [
  { href: '/dashboard', label: 'Home' },
  { href: '/analyze', label: 'Analyze' },
  { href: '/species', label: 'Species' },
  { href: '/history', label: 'History' },
]

export function AppNav() {
  const pathname = usePathname()

  return (
    <header className="nav app-nav">
      <Link href="/dashboard" className="brand brand-lockup" aria-label="PET AI home">
        <span className="brand-mark" aria-hidden="true">◒</span>
        <span>PET AI</span>
      </Link>
      <div className="app-nav-main">
        <nav className="app-nav-links" aria-label="Primary">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/')
            return <Link key={link.href} className={active ? 'active' : ''} href={link.href}>{link.label}</Link>
          })}
        </nav>
        <div className="app-nav-actions">
          <Link className="primary small app-add-pet" href="/pet/new">+ Add pet</Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
