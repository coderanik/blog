"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreVertical } from "lucide-react"

import { AnimatedNavbar } from "@/components/animated-navbar"
import type { BlogPost } from "@/lib/blog-posts"

export function MyBlogClient({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-9xl mx-auto px-4 md:px-6 lg:px-10">
        {/* Tagline */}
        <div className="text-center pt-12 pb-6">
          <p className="text-xl uppercase tracking-[0.2em] text-black font-sans font-light">
            EXPLORING SOFTWARE ARCHITECTURE, AI AND RESEARCH
          </p>
        </div>

        {/* Main Title */}
        <div className="text-center mb-0">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-black pb-14">
            Engineering Insights
          </h1>
        </div>

        {/* Navigation Bar */}
        <div className="mt-6 md:mt-10 mb-8 md:mb-16 p-0">
          <AnimatedNavbar />
        </div>

        {/* Two Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 mb-8 md:mb-16 sm:px-50">
          {initialPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block group"
            >
              <article className="border border-black bg-gray-50 hover:shadow-lg transition-shadow h-full flex flex-col">
                {/* Post Image (if available) */}
                {post.image && (
                  <div className="w-full h-48 md:h-56 lg:h-64 relative overflow-hidden bg-gray-200">
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
                )}

                {/* Post Content */}
                <div className="p-4 md:p-5 lg:p-6 flex-1 flex flex-col">
                  {/* Metadata */}
                  {post.image && (
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                      <div className="text-xs text-gray-500 font-sans">
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
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Title */}
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-black mb-2 md:mb-3 group-hover:text-purple-600 transition-colors">
                    {post.title}
                  </h2>

                  {/* Description */}
                  <p className="text-xs md:text-sm text-gray-600 font-sans leading-relaxed line-clamp-3 flex-1">
                    {post.description}
                  </p>

                  {/* Metadata for posts without images */}
                  {!post.image && (
                    <div className="mt-3 md:mt-4 text-xs text-gray-500 font-sans">
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
                  )}
                </div>
              </article>
            </Link>
          ))}
        </div>

        {initialPosts.length === 0 && (
          <div className="text-center py-8 md:py-16">
            <p className="text-base md:text-lg text-gray-600 font-sans mb-2">No posts found</p>
            <p className="text-xs md:text-sm text-gray-500 font-sans">Create and publish your first blog post to see it here.</p>
          </div>
        )}
      </div>
    </div>
  )
}

