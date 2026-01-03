"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

// Updated nav items to show author name
const navItems = [{ name: "anikdas", href: "/" }]

export function AnimatedNavbar() {
  const pathname = usePathname()

  return (
    <div className="flex justify-center pt-5 sm:pt-10 pb-2 sm:pb-4 px-4">
      <header className="relative z-50 flex justify-between items-center px-4 sm:px-6 md:px-10 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl backdrop-saturate-150 shadow-lg shadow-black/20 w-full max-w-[550px] sm:w-auto sm:min-w-[400px] md:min-w-[550px]">
        {/* Changed brand name to anikdas */}
        <Link href="/" className="text-base sm:text-lg font-bold tracking-tight">
          anikdas
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/"
            className={cn(
              "text-xs sm:text-sm font-medium transition-colors hover:text-white",
              pathname === "/" ? "text-white" : "text-muted-foreground",
            )}
          >
            Articles
          </Link>
          {/* Removed the social icons div and its children */}
        </nav>
      </header>
    </div>
  )
}
