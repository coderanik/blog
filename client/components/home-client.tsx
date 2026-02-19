"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, Twitter, Linkedin, Github, Instagram } from "lucide-react"

import { AnimatedNavbar } from "@/components/animated-navbar"
import { trackClick } from "@/lib/backend-api"
import type { BlogPost } from "@/lib/blog-posts"

interface EngagementStats {
  views: number
  comments: number
  likes: number
}

export function HomeClient({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [allPosts] = useState<BlogPost[]>(initialPosts)
  const loading = false
  const [engagementStats, setEngagementStats] = useState<Record<string, EngagementStats>>({})
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function fetchEngagement() {
      try {
        // Fetch engagement stats for each post
        const stats: Record<string, EngagementStats> = {}
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003/api"
        for (const post of allPosts) {
          try {
            const engagementRes = await fetch(`${API}/engagement/${post.slug}`).catch(() => null)
            const engagement = engagementRes ? await engagementRes.json() : { likes: 0, comments: [] }

            stats[post.slug] = {
              views: 0, // Views will be tracked separately if needed
              comments: engagement.comments?.length || 0,
              likes: engagement.likes || 0,
            }
          } catch {
            stats[post.slug] = { views: 0, comments: 0, likes: 0 }
          }
        }
        setEngagementStats(stats)
      } catch (error) {
        console.error("Failed to fetch engagement stats:", error)
      }
    }

    if (allPosts.length > 0) fetchEngagement()
  }, [allPosts])

  // Get the featured post (one with featuredPost: true), or fallback to first post
  const featuredPost =
    allPosts
      .filter((p) => p.featuredPost)
      .sort(
        (a, b) =>
          (a.featuredOrder ?? 9999) - (b.featuredOrder ?? 9999) ||
          new Date(b.date).getTime() - new Date(a.date).getTime(),
      )[0] || (allPosts.length > 0 ? allPosts[0] : null)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-9xl mx-auto px-4 md:px-6">
        {/* Tagline */}
        <div className="text-center pt-12 pb-6">
          <p className="text-xl uppercase tracking-[0.2em] text-black font-sans font-light">
            EXPLORING SOFTWARE ARCHITECTURE, AI AND RESEARCH
          </p>
        </div>

        {/* Main Title */}
        <div className="text-center mb-0">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-black pb-16">
            Engineering Insights
          </h1>
        </div>

        {/* Navigation Bar */}
        <div className="mb-16 sm:mb-20">
          <AnimatedNavbar />
        </div>

        {/* Featured Post Section */}
        {featuredPost && (
          <div className="mb-8 md:mb-16 border border-black bg-gray-50 mx-auto" style={{ maxWidth: "700px" }}>
            <div className="relative">
              {/* Featured Post Label */}
              <div className="absolute -top-3 -left-0.5 z-10 bg-gray-50 border border-black px-2 py-1 md:px-4 md:py-1.5">
                <span className="text-xl uppercase tracking-wider font-sans font-semibold text-black">
                  FEATURED POST
                </span>
              </div>

              {/* Post Image */}
              {featuredPost.image ? (
                <div className="w-full h-48 md:h-80 relative overflow-hidden bg-gray-200">
                  {imageErrors[featuredPost.slug] ? (
                    <img src={featuredPost.image} alt={featuredPost.title} className="w-full h-full object-cover" />
                  ) : (
                    <img
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover"
                      onError={() => setImageErrors((prev) => ({ ...prev, [featuredPost.slug]: true }))}
                    />
                  )}
                </div>
              ) : (
                <div className="w-full h-48 md:h-80 bg-gray-200 relative overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-sm">Featured Image</span>
                  </div>
                </div>
              )}

              {/* Post Details */}
              <div className="p-4 md:p-6">
                <div className="mb-3 md:mb-4 text-xs md:text-sm text-gray-600 font-sans">
                  <span className="font-medium">Anik Das</span>
                  <span className="mx-2">•</span>
                  <time dateTime={featuredPost.date}>
                    {new Date(featuredPost.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                  <span className="mx-2">•</span>
                  <span>{featuredPost.readTime}</span>
                </div>

                <Link href={`/blog/${featuredPost.slug}`} onClick={() => trackClick(featuredPost.slug)}>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-black mb-3 md:mb-4 hover:text-purple-600 transition-colors leading-tight">
                    {featuredPost.title}
                  </h2>
                </Link>

                <p className="text-sm md:text-base text-gray-600 font-sans leading-relaxed">{featuredPost.description}</p>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-black mb-12"></div>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6 md:gap-12 mb-12 md:mb-16 justify-center">
          {/* Left Column - Blog Posts */}
          <div className="lg:w-[40%] lg:max-w-3xl lg:min-w-0 sm:ml-35">
            <div className="mb-6 md:mb-8">
              <h2 className="text-2xl uppercase tracking-[0.3em] font-sans font-semibold text-black">INSIGHTS</h2>
            </div>

            <div className="space-y-8 md:space-y-12">
              {allPosts.slice(0, 3).map((post) => {
                const stats = engagementStats[post.slug] || { views: 0, comments: 0, likes: 0 }
                return (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="block group"
                    onClick={() => trackClick(post.slug)}
                  >
                    <div className="flex gap-4 md:gap-6 border border-black p-5 md:p-0 transition-colors sm:w-165 sm:h-100">
                      {/* Post Image */}
                      {post.image ? (
                        <div className="w-32 h-32 md:w-80 md:h-99.5 p-0 shrink-0 relative overflow-hidden bg-gray-200">
                          {imageErrors[post.slug] ? (
                            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                          ) : (
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-full h-full object-cover"
                              onError={() => setImageErrors((prev) => ({ ...prev, [post.slug]: true }))}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 bg-gray-200 relative overflow-hidden">
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            Image
                          </div>
                        </div>
                      )}

                      {/* Post Content */}
                      <div className="flex-1">
                        <div className="mb-1 md:mb-2 text-xs text-gray-600 font-sans pt-5 text-left">
                          <time dateTime={post.date}>
                            {new Date(post.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </time>
                          <span className="mx-2">•</span>
                          <span>{post.readTime}</span>
                        </div>

                        <h3 className="text-lg md:text-2xl font-serif font-bold text-black mb-2 group-hover:text-purple-600 transition-colors">
                          {post.title}
                        </h3>

                        <p className="text-xs md:text-sm text-gray-600 font-sans mb-3 md:mb-4 leading-relaxed line-clamp-2 pr-2 pb-10">
                          {post.description}
                        </p>

                        {/* Engagement Stats */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 font-sans">
                          <span>{stats.views} views</span>
                          <span>{stats.comments} comments</span>
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            <span>{stats.likes}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}

              {/* Read More Button */}
              {allPosts.length > 3 && (
                <div className="mt-8 md:mt-12 text-center">
                  <Link
                    href="/myblog"
                    className="inline-block px-6 py-3 border border-gray-400 text-black font-sans hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-colors"
                  >
                    Read More
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:w-[55%] lg:max-w-sm lg:ml-40 border-l border-black pl-6 lg:pl-8 hidden md:block">
            {/* ABOUT ME Section - Hidden on mobile, visible on desktop */}
            <div className="hidden lg:block mb-12">
              <h2 className="text-2xl uppercase tracking-[0.3em] font-sans font-semibold text-black mb-6 text-center">
                ABOUT ME
              </h2>

              {/* Profile Picture */}
              <div className="w-64 h-64 mx-auto mb-6 border-1 border-black relative overflow-hidden bg-gray-200">
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  <Image src="160725845.png" alt="Profile" width={256} height={256} />
                </div>
              </div>

              {/* About Text */}
              <p className="text-sm text-gray-700 font-sans leading-relaxed mb-4 p-10">
                I’m a full-stack developer and open-source contributor focused on building secure, scalable, user-centric
                applications, with a strong interest in AI, computer vision, and NLP.
              </p>

              <div className="flex justify-end">
                <Link href="/about" className="text-sm text-gray-700 font-sans hover:text-purple-600 transition-colors">
                  Read More &gt;
                </Link>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-black mb-12"></div>

            {/* Social Icons */}
            <div className="hidden lg:block mb-12">
              <div className="flex justify-center gap-4">
                <a
                  href="https://twitter.com/anikdas_dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-purple-600 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="https://linkedin.com/in/anikdas21"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-purple-600 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="https://github.com/coderanik"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-purple-600 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="https://instagram.com/anikk.dass"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-purple-600 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div className="border-t border-black mb-12"></div>

            {/* FOLLOW ME Section - Hidden on mobile, visible on desktop */}
            <div className="hidden lg:block">
              <h2 className="text-sm uppercase tracking-[0.3em] font-sans font-semibold text-black mb-6 text-center">
                FOLLOW ME
              </h2>

              {/* Image Grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { path: "3.jpg", alt: "Polish photography" },
                  { path: "4.jpg", alt: "Diwali sky" },
                  { path: "2.jpg", alt: "Nature photography" },
                  { path: "1.jpg", alt: "Diwali celebration" },
                ].map((image, i) => (
                  <div key={i} className="aspect-square bg-gray-200 relative overflow-hidden border border-black">
                    <Image src={`/${image.path}`} alt={image.alt} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {allPosts.length === 0 && !loading && (
          <div className="text-center py-16">
            <p className="text-lg text-gray-600 font-sans mb-2">No posts found</p>
            <p className="text-sm text-gray-500 font-sans">Create and publish your first blog post to see it here.</p>
          </div>
        )}
      </div>
    </div>
  )
}

