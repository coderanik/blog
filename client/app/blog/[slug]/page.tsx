"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Calendar, Clock, MoreVertical } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getPostBySlug, trackClick } from "@/lib/blog-posts"
import { AnimatedNavbar } from "@/components/animated-navbar"
import { calculateReadingTime } from "@/lib/reading-time"
import { PostEngagement } from "@/components/post-engagement"
import type { BlogPost } from "@/lib/blog-posts"

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    async function fetchPost() {
      if (!slug) {
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        setError(null)
        const postData = await getPostBySlug(slug)
        if (!postData) {
          setError('Post not found')
          setLoading(false)
          return
        }
        setPost(postData)
        setImageError(false) // Reset image error when post changes
      } catch (error) {
        console.error('Failed to fetch post:', error)
        setError('Failed to load post. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [slug])

  // Remove inline color styles from blog post content to ensure readable text
  // But preserve all other formatting including spacing
  useEffect(() => {
    if (post?.content) {
      // Use setTimeout to ensure DOM is updated after dangerouslySetInnerHTML
      setTimeout(() => {
        const contentElement = document.querySelector('.blog-post-content')
        if (contentElement) {
          // Set white-space on the container to preserve formatting
          const container = contentElement as HTMLElement
          container.style.whiteSpace = 'pre-wrap'
          container.style.wordWrap = 'break-word'
          
          const allElements = contentElement.querySelectorAll('*')
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement
            // Remove inline color styles only, preserve everything else
            if (htmlEl.style.color) {
              htmlEl.style.removeProperty('color')
            }
            // Preserve white-space on all elements
            if (!htmlEl.style.whiteSpace) {
              htmlEl.style.whiteSpace = 'pre-wrap'
            }
            // Check computed color and fix if it's too light
            const computedColor = window.getComputedStyle(htmlEl).color
            if (computedColor) {
              // Extract RGB values
              const rgbMatch = computedColor.match(/\d+/g)
              if (rgbMatch && rgbMatch.length >= 3) {
                const r = parseInt(rgbMatch[0])
                const g = parseInt(rgbMatch[1])
                const b = parseInt(rgbMatch[2])
                // Calculate luminance (simplified)
                const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255
                // If text is too light (luminance > 0.7), make it dark
                if (luminance > 0.7 && !htmlEl.tagName.match(/^(H1|H2|H3|H4|H5|H6)$/)) {
                  htmlEl.style.color = 'rgb(17, 24, 39)'
                } else if (luminance > 0.7 && htmlEl.tagName.match(/^(H1|H2|H3|H4|H5|H6)$/)) {
                  htmlEl.style.color = 'rgb(0, 0, 0)'
                }
              }
            }
          })
        }
      }, 100)
    }
  }, [post])

  const handleLinkClick = () => {
    if (post) {
      trackClick(post.slug)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-9xl mx-auto px-6">
          <div className="text-center pt-12 pb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-black font-sans font-light">
              EXPLORING SOFTWARE ARCHITECTURE, AI AND RESEARCH
            </p>
          </div>
          <div className="text-center mb-0">
            <h1 className="text-6xl md:text-7xl lg:text-[110px] font-serif font-bold text-black pb-14">
              Engineering Insights
            </h1>
          </div>
          <div className="mb-8">
            <AnimatedNavbar />
          </div>
          <div className="max-w-4xl mx-auto text-center py-16">
            <h2 className="text-2xl font-serif font-bold text-black mb-4">
              {error || 'Post not found'}
            </h2>
            <p className="text-gray-600 font-sans mb-6">
              {error || 'The blog post you are looking for does not exist.'}
            </p>
            <Link 
              href="/" 
              className="inline-block px-6 py-3 border border-gray-400 text-black font-sans hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Calculate reading time from content if available (as fallback)
  const displayReadTime = post.content 
    ? calculateReadingTime(post.content) 
    : post.readTime

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Tagline */}
        <div className="text-center pt-12 pb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-black font-sans font-light">
          EXPLORING SOFTWARE ARCHITECTURE, AI AND RESEARCH
          </p>
        </div>

        {/* Main Title */}
        <div className="text-center mb-0">
          <h1 className="text-6xl md:text-7xl lg:text-[110px] font-serif font-bold text-black pb-14">
            Engineering Insights
          </h1>
        </div>


        {/* Navigation Bar */}
        <div className="mb-8">
          <AnimatedNavbar />
        </div>


        {/* Main Content */}
        <div className="mb-16">
          {/* Blog Post Content */}
          <div className="max-w-4xl mx-auto">
            <article className="border border-black bg-gray-50">
              {/* Post Header */}
              <div className="relative p-8 pb-6">
                {/* Metadata - Top Left */}
                <div className="absolute top-8 left-8 text-sm text-gray-500 font-sans">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                  <span className="mx-2">·</span>
                  <span>{displayReadTime}</span>
                </div>

                {/* Options Icon - Top Right */}
                <button className="absolute top-8 right-8 text-gray-500 hover:text-gray-700 transition-colors">
                  <MoreVertical className="h-5 w-5" />
                </button>

                {/* Post Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-black mb-4 mt-12 leading-tight">
                  {post.title}
                </h1>

                {/* Post Subtitle/Description */}
                <p className="text-lg text-gray-700 font-sans leading-relaxed mb-6">
                  {post.description}
                </p>
              </div>

              {/* Featured Image */}
              {post.image ? (
                <div className="w-full h-96 relative overflow-hidden bg-gray-200">
                  {imageError ? (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover"
                      onError={() => {
                        console.warn('Next.js Image failed, falling back to regular img tag')
                        setImageError(true)
                      }}
                    />
                  )}
                </div>
              ) : (
                <div className="w-full h-96 bg-gray-200 relative overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-sm">Featured Image</span>
                  </div>
                </div>
              )}

              {/* Post Body */}
              <div className="p-8 pt-6">
                {post.content && post.content.trim() ? (
                  <div 
                    className="blog-post-content font-sans text-gray-900"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                    style={{
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                    } as React.CSSProperties}
                  />
                ) : (
                  <div className="font-sans text-gray-900">
                    <p className="text-gray-500 italic">Content is not available for this post.</p>
                  </div>
                )}
              </div>
            </article>

            {/* Engagement Section */}
            <div className="max-w-4xl mx-auto mt-8">
              <PostEngagement slug={post.slug} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
