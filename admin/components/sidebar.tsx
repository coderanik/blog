"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, FileText, Mail, LogOut, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { isAuthenticated, removeAuthToken } from '@/lib/auth'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Only redirect if not already on login page to prevent loops
    if (!isAuthenticated() && pathname !== '/login') {
      router.push('/login')
    }
  }, [router, pathname])

  const handleLogout = () => {
    removeAuthToken()
    router.push('/login')
  }

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/contact', label: 'Contact', icon: Mail },
    { href: '/drafts', label: 'Drafts', icon: FileText },
  ]

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const closeSidebar = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Hamburger Menu Button - Mobile Only */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-black text-black hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay - Mobile Only */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          w-64 bg-white border-r border-black h-screen fixed left-0 top-0 flex flex-col z-40
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-4 md:p-6 border-b border-black flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-serif font-bold text-black">Admin Panel</h2>
          <button
            onClick={closeSidebar}
            className="md:hidden p-1 hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-black" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-4 py-3 border border-black transition-colors font-sans ${
                  isActive
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'text-black hover:bg-purple-600 hover:text-white hover:border-purple-600'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-black">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors font-sans"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

