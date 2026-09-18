'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoutButton } from '@/components/logout-button'

const links = [
  { href: '/dashboard', label: 'Home', icon: '⌂' },
  { href: '/analyze', label: 'Analyze', icon: '◉' },
  { href: '/species', label: 'Species', icon: '◌' },
  { href: '/history', label: 'History', icon: '◷' },
]

export function AppNav() {
  const pathname = usePathname()

  return (
    <>
      <header className="nav app-nav">
        <Link href="/dashboard" className="brand brand-lockup" aria-label="PET AI home">
          <span className="brand-mark" aria-hidden="true">◒</span>
          <span>PET AI</span><small className="brand-subtitle">Understand better.</small>
        </Link>
        <div className="app-nav-main">
          <nav className="app-nav-links" aria-label="Primary">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + '/')
              return <Link key={link.href} className={active ? 'active' : ''} href={link.href}><span className="desktop-nav-label">{link.label}</span><span className="mobile-nav-icon" aria-hidden="true">{link.icon}</span></Link>
            })}
          </nav>
          <div className="app-nav-actions">
            <Link className="primary small app-add-pet" href="/pet/new">+ Add pet</Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <nav className="mobile-bottom-nav" aria-label="Mobile primary">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + '/')
          return <Link key={link.href} className={active ? 'active' : ''} href={link.href}><span aria-hidden="true">{link.icon}</span><small>{link.label}</small></Link>
        })}
        <Link className="mobile-bottom-add" href="/pet/new" aria-label="Add a pet"><span aria-hidden="true">+</span><small>Add</small></Link>
      </nav>
    </>
  )
}