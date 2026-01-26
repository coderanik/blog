"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Trash2, Calendar, Plus } from 'lucide-react'
import Link from 'next/link'
import { getDrafts, deleteBlog, type Blog } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

export default function DraftsPage() {
  const router = useRouter()
  const [drafts, setDrafts] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    fetchDrafts()
  }, [router])

  const fetchDrafts = async () => {
    try {
      setLoading(true)
      const data = await getDrafts()
      setDrafts(data)
    } catch (error) {
      console.error('Failed to fetch drafts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) return
    try {
      await deleteBlog(id)
      setDrafts(drafts.filter(draft => draft._id !== id))
    } catch (error) {
      console.error('Failed to delete draft:', error)
      alert('Failed to delete draft')
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-screen bg-white pt-16 md:pt-8">
        <div className="text-gray-600 font-sans">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 bg-white min-h-screen pt-16 md:pt-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-black mb-2">Drafts</h1>
        <p className="text-sm md:text-base text-gray-600 font-sans">Manage your draft blog posts</p>
      </div>

      <div className="bg-white border border-black p-4 md:p-6">
        <div className="space-y-3 md:space-y-4">
          {drafts.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <p className="text-gray-600 font-sans text-sm md:text-base">No drafts found</p>
            </div>
          ) : (
            drafts.map((draft) => (
              <div
                key={draft._id}
                className="bg-white border border-black p-3 md:p-4 hover:border-purple-600 transition-colors"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-serif font-semibold text-black mb-1 md:mb-2 break-words">{draft.title}</h3>
                    <p className="text-sm md:text-base text-gray-600 mb-2 md:mb-3 font-sans line-clamp-2">{draft.description}</p>
                    <div className="flex flex-wrap items-center gap-2 md:gap-2 text-xs md:text-sm text-gray-600 font-sans">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                        <span>{new Date(draft.date).toLocaleDateString()}</span>
                      </div>
                      <span className="px-2 py-1 bg-yellow-100 border border-yellow-600 text-yellow-700 font-sans text-xs">Draft</span>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:ml-4 flex-shrink-0">
                    <button 
                      onClick={() => router.push(`/create?id=${draft._id}`)}
                      className="p-2 border border-black hover:bg-purple-600 hover:text-white hover:border-purple-600 rounded transition-colors text-black"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(draft._id)}
                      className="p-2 border border-black hover:bg-red-600 hover:text-white hover:border-red-600 rounded transition-colors text-black"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Link
        href="/create"
        className="fixed bottom-4 right-4 md:bottom-8 md:right-8 bg-purple-600 hover:bg-purple-700 text-white p-3 md:p-4 border border-black shadow-lg transition-colors flex items-center justify-center z-50 rounded-full w-12 h-12 md:w-14 md:h-14"
        aria-label="Create Blog"
      >
        <Plus className="h-5 w-5 md:h-6 md:w-6" />
      </Link>
    </div>
  )
}

