"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Eye, MousePointerClick, Heart, MessageSquare, BarChart3, Mail } from 'lucide-react'
import Link from 'next/link'
import {
  getPostsFromClient,
  getAnalyticsSummary,
  getEngagementList,
  type PostMeta,
  type AnalyticsSummary,
  type EngagementItem,
} from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

export default function DashboardPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<PostMeta[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)
  const [engagement, setEngagement] = useState<EngagementItem[]>([])
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
      const [postsData, analyticsData, engagementData] = await Promise.all([
        getPostsFromClient(),
        getAnalyticsSummary(),
        getEngagementList(),
      ])
      setPosts(postsData)
      setAnalytics(analyticsData)
      setEngagement(engagementData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStats = (slug: string) => {
    const views = analytics?.blogAnalytics.find((a) => a._id.blogSlug === slug)?.views ?? 0
    const clicks = analytics?.blogAnalytics.find((a) => a._id.blogSlug === slug)?.clicks ?? 0
    const eng = engagement.find((e) => e.slug === slug)
    return {
      views,
      clicks,
      likes: eng?.likes ?? 0,
      comments: eng?.comments?.length ?? 0,
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
      <div className="mb-6 md:mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-black mb-2">Dashboard</h1>
          <p className="text-sm md:text-base text-gray-600 font-sans">Post engagement & analytics</p>
        </div>
        <Link
          href="/dashboard/contact"
          className="inline-flex items-center gap-2 px-4 py-2 border border-black hover:bg-purple-600 hover:text-white transition-colors font-sans text-sm"
        >
          <Mail className="h-4 w-4" />
          Contact submissions
        </Link>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white border border-black p-4 md:p-6">
            <h3 className="text-gray-600 text-xs md:text-sm mb-2 flex items-center gap-2 font-sans">
              <Eye className="h-3 w-3 md:h-4 md:w-4" />
              Total views
            </h3>
            <p className="text-2xl md:text-3xl font-serif font-bold text-black">{analytics.totalViews}</p>
          </div>
          <div className="bg-white border border-black p-4 md:p-6">
            <h3 className="text-gray-600 text-xs md:text-sm mb-2 flex items-center gap-2 font-sans">
              <MousePointerClick className="h-3 w-3 md:h-4 md:w-4" />
              Total clicks
            </h3>
            <p className="text-2xl md:text-3xl font-serif font-bold text-black">{analytics.totalClicks}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-black p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-serif font-bold text-black mb-4 md:mb-6">Posts & engagement</h2>
        <div className="space-y-3 md:space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-8 md:py-12 text-gray-600 font-sans text-sm md:text-base">
              No posts yet. Add MDX files in the client blog.
            </div>
          ) : (
            posts.map((post) => {
              const stats = getStats(post.slug)
              return (
                <div
                  key={post.slug}
                  className="border border-black p-3 md:p-4 hover:border-purple-600 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-serif font-semibold text-black mb-1 md:mb-2 break-words">
                        {post.title}
                      </h3>
                      <p className="text-sm md:text-base text-gray-600 mb-2 md:mb-3 font-sans line-clamp-2">
                        {post.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-600 font-sans">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                          {new Date(post.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3 md:h-4 md:w-4" />
                          {stats.views} views
                        </span>
                        <span className="flex items-center gap-1">
                          <MousePointerClick className="h-3 w-3 md:h-4 md:w-4" />
                          {stats.clicks} clicks
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3 md:h-4 md:w-4" />
                          {stats.likes} likes
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
                          {stats.comments} comments
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/analytics/${post.slug}`}
                      className="inline-flex items-center gap-2 px-3 py-2 border border-black hover:bg-purple-600 hover:text-white transition-colors text-sm font-sans flex-shrink-0"
                    >
                      <BarChart3 className="h-4 w-4" />
                      View analytics
                    </Link>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
