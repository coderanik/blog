import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Footer } from '@/components/footer'
import { ScrollToTop } from '@/components/scroll-to-top'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' })
const avenirLight = localFont({
  src: '../public/Avenir Light/Avenir Light.ttf',
  variable: '--font-avenir-light',
  display: 'swap',
})

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
    <html lang="en" className="light">
      <body className={`${inter.variable} ${playfair.variable} ${avenirLight.variable} font-sans antialiased bg-gray-50`}>
        <main className="min-h-screen">{children}</main>
        <Footer />
        <ScrollToTop />
        <Analytics />
      </body>
    </html>
  )
}
