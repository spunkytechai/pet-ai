import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PET AI — Understand Your Pet',
  description: 'AI-assisted interpretation of pet vocalizations and context.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
