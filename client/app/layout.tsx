import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AnimatedNavbar } from '@/components/animated-navbar'
import { Footer } from '@/components/footer'
import { ScrollToTop } from '@/components/scroll-to-top'
import { ResponsiveBackground } from '@/components/responsive-background'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'anikdas',
  description:
    'Thoughts on software engineering, AI, research, and building meaningful products.',
  icons: {
    icon: [
      {
        url: '/160725845.png',
        type: 'image/png',
        sizes: 'any',
      },
    ],
    apple: '/160725845.png',
    shortcut: '/160725845.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} font-sans antialiased`}>
        <ResponsiveBackground />
        <AnimatedNavbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <ScrollToTop />
        <Analytics />
      </body>
    </html>
  )
}
