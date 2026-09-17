import type { Metadata, Viewport } from 'next'
import './globals.css'
import './product-ui.css'

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pet-ai-chi.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'PET AI — Understand Your Pet', template: '%s · PET AI' },
  description: 'AI-assisted interpretation of pet vocalizations and context — thoughtful, probabilistic, and personalized to your pet.',
  applicationName: 'PET AI',
  keywords: ['pet AI','dog sounds','cat sounds','pet communication','animal vocalization','dog behavior','cat behavior'],
  authors: [{ name: 'PET AI' }], creator: 'PET AI', publisher: 'PET AI',
  robots: { index:true, follow:true, googleBot:{ index:true, follow:true, 'max-image-preview':'large', 'max-snippet':-1, 'max-video-preview':-1 } },
  openGraph: { type:'website', siteName:'PET AI', title:'PET AI — Understand Your Pet', description:'Turn pet sounds and context into thoughtful, probabilistic interpretations personalized to your pet.', url:siteUrl },
  twitter: { card:'summary_large_image', title:'PET AI — Understand Your Pet', description:'AI-assisted, probabilistic pet communication insights.' },
  category:'technology',
}
export const viewport: Viewport = { width:'device-width', initialScale:1, viewportFit:'cover', themeColor:'#f4f0e8' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<div id="pet-ai-status" aria-live="polite" /></body></html>
}
