"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Calendar, Eye, MousePointerClick } from 'lucide-react'
import Link from 'next/link'
import { getAllBlogs, deleteBlog, getAnalyticsSummary, type Blog, type AnalyticsSummary } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

export default function DashboardPage() {
  const router = useRouter()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [blogsData, analyticsData] = await Promise.all([
        getAllBlogs(),
        getAnalyticsSummary()
      ])
      setBlogs(blogsData)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return
    try {
      await deleteBlog(id)
      setBlogs(blogs.filter(blog => blog._id !== id))
    } catch (error) {
      console.error('Failed to delete blog:', error)
      alert('Failed to delete blog')
    }
  }

  const publishedBlogs = blogs.filter(blog => blog.status === 'published')
  const drafts = blogs.filter(blog => blog.status === 'draft')

  const getBlogAnalytics = (slug: string) => {
    if (!analytics) return { views: 0, clicks: 0 }
    const blogAnalytic = analytics.blogAnalytics.find(
      a => a._id.blogSlug === slug
    )
    return {
      views: blogAnalytic?.views || 0,
      clicks: blogAnalytic?.clicks || 0
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
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Manage your blog posts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-black/20 backdrop-blur-xl backdrop-saturate-150 rounded-xl border border-white/10 p-6">
          <h3 className="text-muted-foreground text-sm mb-2">Total Blogs</h3>
          <p className="text-3xl font-bold text-white">{blogs.length}</p>
        </div>
        <div className="bg-black/20 backdrop-blur-xl backdrop-saturate-150 rounded-xl border border-white/10 p-6">
          <h3 className="text-muted-foreground text-sm mb-2">Published</h3>
          <p className="text-3xl font-bold text-white">{publishedBlogs.length}</p>
        </div>
        <div className="bg-black/20 backdrop-blur-xl backdrop-saturate-150 rounded-xl border border-white/10 p-6">
          <h3 className="text-muted-foreground text-sm mb-2">Drafts</h3>
          <p className="text-3xl font-bold text-white">{drafts.length}</p>
        </div>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-black/20 backdrop-blur-xl backdrop-saturate-150 rounded-xl border border-white/10 p-6">
            <h3 className="text-muted-foreground text-sm mb-2 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Total Views
            </h3>
            <p className="text-3xl font-bold text-white">{analytics.totalViews}</p>
          </div>
          <div className="bg-black/20 backdrop-blur-xl backdrop-saturate-150 rounded-xl border border-white/10 p-6">
            <h3 className="text-muted-foreground text-sm mb-2 flex items-center gap-2">
              <MousePointerClick className="h-4 w-4" />
              Total Clicks
            </h3>
            <p className="text-3xl font-bold text-white">{analytics.totalClicks}</p>
          </div>
        </div>
      )}

      <div className="bg-black/20 backdrop-blur-xl backdrop-saturate-150 rounded-xl border border-white/10 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Published Blogs</h2>
        </div>

        <div className="space-y-4">
          {publishedBlogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No published blogs yet</div>
          ) : (
            publishedBlogs.map((blog) => {
              const blogStats = getBlogAnalytics(blog.slug)
              return (
                <div
                  key={blog._id}
                  className="bg-black/30 rounded-lg border border-white/10 p-4 hover:border-purple-500/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{blog.title}</h3>
                      <p className="text-muted-foreground mb-3">{blog.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(blog.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{blogStats.views} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MousePointerClick className="h-4 w-4" />
                          <span>{blogStats.clicks} clicks</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button 
                        onClick={() => router.push(`/create?id=${blog._id}`)}
                        className="p-2 hover:bg-purple-600/30 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4 text-white" />
                      </button>
                      <button 
                        onClick={() => handleDelete(blog._id)}
                        className="p-2 hover:bg-red-600/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <Link
        href="/create"
        className="fixed bottom-8 right-8 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg transition-colors flex items-center gap-2 z-10"
      >
        <Plus className="h-6 w-6" />
        <span className="hidden sm:inline">Create Blog</span>
      </Link>
    </div>
  )
}

