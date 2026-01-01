"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Trash2, Calendar } from 'lucide-react'
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
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Drafts</h1>
        <p className="text-muted-foreground">Manage your draft blog posts</p>
      </div>

      <div className="bg-black/20 backdrop-blur-xl backdrop-saturate-150 rounded-xl border border-white/10 p-6">
        <div className="space-y-4">
          {drafts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No drafts found</p>
            </div>
          ) : (
            drafts.map((draft) => (
              <div
                key={draft._id}
                className="bg-black/30 rounded-lg border border-white/10 p-4 hover:border-purple-500/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{draft.title}</h3>
                    <p className="text-muted-foreground mb-3">{draft.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(draft.date).toLocaleDateString()}</span>
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">Draft</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button 
                      onClick={() => router.push(`/create?id=${draft._id}`)}
                      className="p-2 hover:bg-purple-600/30 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4 text-white" />
                    </button>
                    <button 
                      onClick={() => handleDelete(draft._id)}
                      className="p-2 hover:bg-red-600/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

