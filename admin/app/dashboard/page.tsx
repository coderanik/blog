"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Calendar, Eye, MousePointerClick, Star } from 'lucide-react'
import Link from 'next/link'
import { getAllBlogs, deleteBlog, getAnalyticsSummary, setFeaturedPost, type Blog, type AnalyticsSummary } from '@/lib/api'
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

  const handleSetFeatured = async (id: string) => {
    try {
      await setFeaturedPost(id)
      // Update local state
      setBlogs(blogs.map(blog => ({
        ...blog,
        featuredPost: blog._id === id
      })))
    } catch (error) {
      console.error('Failed to set featured post:', error)
      alert('Failed to set featured post')
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
      <div className="p-8 flex items-center justify-center min-h-screen bg-white">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 bg-white min-h-screen pt-16 md:pt-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-black mb-2">Dashboard</h1>
        <p className="text-sm md:text-base text-gray-600 font-sans">Manage your blog posts</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white border border-black p-4 md:p-6">
          <h3 className="text-gray-600 text-xs md:text-sm mb-2 font-sans">Total Blogs</h3>
          <p className="text-2xl md:text-3xl font-serif font-bold text-black">{blogs.length}</p>
        </div>
        <div className="bg-white border border-black p-4 md:p-6">
          <h3 className="text-gray-600 text-xs md:text-sm mb-2 font-sans">Published</h3>
          <p className="text-2xl md:text-3xl font-serif font-bold text-black">{publishedBlogs.length}</p>
        </div>
        <div className="bg-white border border-black p-4 md:p-6">
          <h3 className="text-gray-600 text-xs md:text-sm mb-2 font-sans">Drafts</h3>
          <p className="text-2xl md:text-3xl font-serif font-bold text-black">{drafts.length}</p>
        </div>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white border border-black p-4 md:p-6">
            <h3 className="text-gray-600 text-xs md:text-sm mb-2 flex items-center gap-2 font-sans">
              <Eye className="h-3 w-3 md:h-4 md:w-4" />
              Total Views
            </h3>
            <p className="text-2xl md:text-3xl font-serif font-bold text-black">{analytics.totalViews}</p>
          </div>
          <div className="bg-white border border-black p-4 md:p-6">
            <h3 className="text-gray-600 text-xs md:text-sm mb-2 flex items-center gap-2 font-sans">
              <MousePointerClick className="h-3 w-3 md:h-4 md:w-4" />
              Total Clicks
            </h3>
            <p className="text-2xl md:text-3xl font-serif font-bold text-black">{analytics.totalClicks}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-black p-4 md:p-6">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-serif font-bold text-black">Published Blogs</h2>
        </div>

        <div className="space-y-3 md:space-y-4">
          {publishedBlogs.length === 0 ? (
            <div className="text-center py-8 md:py-12 text-gray-600 font-sans text-sm md:text-base">No published blogs yet</div>
          ) : (
            publishedBlogs.map((blog) => {
              const blogStats = getBlogAnalytics(blog.slug)
              return (
                <div
                  key={blog._id}
                  className="bg-white border border-black p-3 md:p-4 hover:border-purple-600 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-serif font-semibold text-black mb-1 md:mb-2 break-words">{blog.title}</h3>
                      <p className="text-sm md:text-base text-gray-600 mb-2 md:mb-3 font-sans line-clamp-2">{blog.description}</p>
                      <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600 font-sans">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                          <span>{new Date(blog.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3 md:h-4 md:w-4" />
                          <span>{blogStats.views} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MousePointerClick className="h-3 w-3 md:h-4 md:w-4" />
                          <span>{blogStats.clicks} clicks</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 sm:ml-4 flex-shrink-0">
                      <button 
                        onClick={() => handleSetFeatured(blog._id)}
                        className={`p-2 border border-black rounded transition-colors ${
                          blog.featuredPost 
                            ? 'bg-purple-600 text-white border-purple-600' 
                            : 'hover:bg-purple-600 hover:text-white hover:border-purple-600 text-black'
                        }`}
                        title={blog.featuredPost ? 'Featured Post' : 'Set as Featured'}
                      >
                        <Star className={`h-4 w-4 ${blog.featuredPost ? 'fill-current' : ''}`} />
                      </button>
                      <button 
                        onClick={() => router.push(`/create?id=${blog._id}`)}
                        className="p-2 border border-black hover:bg-purple-600 hover:text-white hover:border-purple-600 rounded transition-colors text-black"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(blog._id)}
                        className="p-2 border border-black hover:bg-red-600 hover:text-white hover:border-red-600 rounded transition-colors text-black"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
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
        className="fixed bottom-4 right-4 md:bottom-8 md:right-8 bg-purple-600 hover:bg-purple-700 text-white p-3 md:p-4 border border-black shadow-lg transition-colors flex items-center justify-center z-50 rounded-full w-12 h-12 md:w-14 md:h-14"
        aria-label="Create Blog"
      >
        <Plus className="h-5 w-5 md:h-6 md:w-6" />
      </Link>
    </div>
  )
}

