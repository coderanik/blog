"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, MousePointerClick, Globe } from 'lucide-react'
import { getBlogAnalytics, getPostsFromClient, type BlogAnalyticsDetail, type PostMeta } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

export default function AnalyticsSlugPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [analytics, setAnalytics] = useState<BlogAnalyticsDetail | null>(null)
  const [post, setPost] = useState<PostMeta | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    if (!slug) return
    const load = async () => {
      try {
        setLoading(true)
        const [data, posts] = await Promise.all([
          getBlogAnalytics(slug),
          getPostsFromClient(),
        ])
        setAnalytics(data)
        setPost(posts.find((p) => p.slug === slug) ?? null)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug, router])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-white">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Analytics not found.</p>
        <Link href="/dashboard" className="text-purple-600 hover:underline mt-2 inline-block">
          Back to dashboard
        </Link>
      </div>
    )
  }

  const hasTimezone = (analytics.viewsByTimezone?.length ?? 0) > 0 || (analytics.clicksByTimezone?.length ?? 0) > 0

  return (
    <div className="p-4 md:p-8 bg-white min-h-screen pt-16 md:pt-8">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-sans text-gray-600 hover:text-purple-600 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-black">
          {post?.title ?? slug}
        </h1>
        <p className="text-sm text-gray-600 font-sans mt-1">Slug: {slug}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
        <div className="border border-black p-4 md:p-6">
          <h3 className="text-gray-600 text-xs md:text-sm mb-2 flex items-center gap-2 font-sans">
            <Eye className="h-4 w-4" />
            Total views
          </h3>
          <p className="text-2xl md:text-3xl font-serif font-bold text-black">{analytics.views}</p>
        </div>
        <div className="border border-black p-4 md:p-6">
          <h3 className="text-gray-600 text-xs md:text-sm mb-2 flex items-center gap-2 font-sans">
            <MousePointerClick className="h-4 w-4" />
            Total clicks
          </h3>
          <p className="text-2xl md:text-3xl font-serif font-bold text-black">{analytics.clicks}</p>
        </div>
      </div>

      {hasTimezone && (
        <div className="space-y-6 mb-8">
          <h2 className="text-xl font-serif font-bold text-black flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Read by timezone
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-black p-4">
              <h3 className="text-sm font-sans font-semibold text-gray-700 mb-3">Views by timezone</h3>
              {(analytics.viewsByTimezone?.length ?? 0) === 0 ? (
                <p className="text-sm text-gray-500 font-sans">No timezone data yet</p>
              ) : (
                <table className="w-full text-sm font-sans">
                  <thead>
                    <tr className="border-b border-black text-left">
                      <th className="py-2 pr-4">Timezone</th>
                      <th className="py-2">Views</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.viewsByTimezone?.map((row) => (
                      <tr key={row._id} className="border-b border-gray-200">
                        <td className="py-2 pr-4 text-gray-800">{row._id}</td>
                        <td className="py-2 font-medium">{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="border border-black p-4">
              <h3 className="text-sm font-sans font-semibold text-gray-700 mb-3">Clicks by timezone</h3>
              {(analytics.clicksByTimezone?.length ?? 0) === 0 ? (
                <p className="text-sm text-gray-500 font-sans">No timezone data yet</p>
              ) : (
                <table className="w-full text-sm font-sans">
                  <thead>
                    <tr className="border-b border-black text-left">
                      <th className="py-2 pr-4">Timezone</th>
                      <th className="py-2">Clicks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.clicksByTimezone?.map((row) => (
                      <tr key={row._id} className="border-b border-gray-200">
                        <td className="py-2 pr-4 text-gray-800">{row._id}</td>
                        <td className="py-2 font-medium">{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {(analytics.viewsOverTime?.length ?? 0) > 0 && (
        <div className="border border-black p-4">
          <h3 className="text-sm font-sans font-semibold text-gray-700 mb-3">Views over time (last 30 days)</h3>
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-black text-left">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2">Views</th>
              </tr>
            </thead>
            <tbody>
              {analytics.viewsOverTime?.map((row) => (
                <tr key={row._id} className="border-b border-gray-200">
                  <td className="py-2 pr-4 text-gray-800">{row._id}</td>
                  <td className="py-2 font-medium">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
