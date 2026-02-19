"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'

export default function DraftsPage() {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="p-4 md:p-8 bg-white min-h-screen pt-16 md:pt-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-black mb-2">Drafts</h1>
        <p className="text-sm md:text-base text-gray-600 font-sans max-w-xl">
          Draft management via the database has been disabled. Posts and drafts are now managed as
          Markdown/MDX files in the client project (e.g. <code>client/content/posts</code>).
        </p>
      </div>
    </div>
  )
}
