"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

// Updated nav items to show author name
const navItems = [{ name: "anikdas", href: "/" }]

export function AnimatedNavbar() {
  const pathname = usePathname()

  return (
    <div className="flex justify-center pt-4 pb-4">
      <header className="relative z-50 flex justify-between items-center px-10 py-3 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl backdrop-saturate-150 shadow-lg shadow-black/20 w-auto min-w-[550px]">
        {/* Changed brand name to anikdas */}
        <Link href="/" className="text-lg font-bold tracking-tight">
          anikdas
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-white",
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
