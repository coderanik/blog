"use client"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Search, Instagram , Facebook } from "lucide-react"
import { SearchModal } from "./search-modal"

export function AnimatedNavbar() {
  const pathname = usePathname()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const socialIcons = [
    { icon: <Facebook className="h-4 w-4" />, href: "https://facebook.com", label: "Facebook" },
    { icon: <Instagram className="h-4 w-4" />, href: "https://instagram.com", label: "Instagram" },
    { icon: <Image src="/image.png" alt="X" width={16} height={16} className="h-4 w-4" />, href: "https://x.com/anikdas_dev", label: "X" },
  ]

  return (
    <div className="w-full bg-gray-50 border-t border-b border-black  ">
      <nav className="max-w-9xl mx-auto flex items-stretch h-14">
        {/* Home */}
        <div className="flex items-stretch flex-1">
          <Link
            href="/"
            className={cn(
              "flex-1 flex items-center justify-center text-sm font-sans transition-colors",
              pathname === "/"
                ? "text-purple-600"
                : "text-gray-700 hover:text-gray-900"
            )}
          >
            Home
          </Link>
        </div>

        <div className="w-px bg-black" />

        {/* My Blog */}
        <div className="flex items-stretch flex-1">
          <Link
            href="/myblog"
            className={cn(
              "flex-1 flex items-center justify-center text-sm font-sans transition-colors",
              pathname === "/myblog"
                ? "text-purple-600"
                : "text-gray-700 hover:text-gray-900"
            )}
          >
            My Blog
          </Link>
        </div>

        <div className="w-px bg-black" />

        {/* Contact */}
        <div className="flex items-stretch flex-1">
          <Link
            href="/contact"
            className={cn(
              "flex-1 flex items-center justify-center text-sm font-sans transition-colors",
              pathname === "/contact"
                ? "text-purple-600"
                : "text-gray-700 hover:text-gray-900"
            )}
          >
            Contact
          </Link>
        </div>

        <div className="w-px bg-black" />

        {/* About Me - Visible on mobile, hidden on desktop */}
        <div className="md:hidden flex items-stretch flex-1">
          <Link
            href="/about"
            className={cn(
              "flex-1 flex items-center justify-center text-sm font-sans transition-colors",
              pathname === "/about"
                ? "text-purple-600"
                : "text-gray-700 hover:text-gray-900"
            )}
          >
            About Me
          </Link>
        </div>

        {/* Search - Hidden on mobile, visible on desktop */}
        <div className="hidden md:flex items-stretch flex-1">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex-1 flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </button>
        </div>

        <div className="hidden md:block w-px bg-black" />

        {/* Social Icons - Hidden on mobile, visible on desktop */}
        <div className="hidden md:flex items-stretch flex-1">
          <div className="flex-1 flex items-center justify-center gap-4">
            {socialIcons.map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                {typeof social.icon === "string" ? (
                  <span className="text-sm font-sans">{social.icon}</span>
                ) : (
                  social.icon
                )}
                <span className="sr-only">{social.label}</span>
              </a>
            ))}
          </div>
        </div>
      </nav>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  )
}
