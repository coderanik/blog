"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Calendar, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getPostBySlug, trackClick } from "@/lib/blog-posts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ReadingProgress } from "@/components/reading-progress"
import { ShareButtons } from "@/components/share-buttons"
import { calculateReadingTime } from "@/lib/reading-time"
import type { BlogPost } from "@/lib/blog-posts"

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPost() {
      try {
        const postData = await getPostBySlug(slug)
        if (!postData) {
          router.push('/404')
          return
        }
        setPost(postData)
      } catch (error) {
        console.error('Failed to fetch post:', error)
        router.push('/404')
      } finally {
        setLoading(false)
      }
    }
    if (slug) {
      fetchPost()
    }
  }, [slug, router])

  const handleLinkClick = () => {
    if (post) {
      trackClick(post.slug)
    }
  }

  if (loading) {
    return (
      <div className="py-12 px-6 min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!post) {
    return null
  }

  const postUrl = typeof window !== 'undefined' ? `${window.location.origin}/blog/${slug}` : `https://yourblog.com/blog/${slug}`

  // Calculate reading time from content if available (as fallback)
  const displayReadTime = post.content 
    ? calculateReadingTime(post.content) 
    : post.readTime

  return (
    <>
      <ReadingProgress />
      <div className="py-12 px-4 pb-6 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <Link href="/">
            <Button variant="ghost" className="mb-8 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>

          <div>
            <article className="max-w-5xl mx-auto px-4 py-6 sm:px-6 sm:py-8 md:bg-black/20 md:backdrop-blur-3xl md:backdrop-saturate-150 md:rounded-3xl md:border md:border-white/10 md:shadow-lg md:shadow-black/20 md:px-10 md:py-10 lg:px-12 lg:py-12">
              <header className="mb-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">{post.title}</h1>

                <p className="text-xl text-muted-foreground mb-6 leading-relaxed text-pretty">{post.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-6 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{displayReadTime}</span>
                  </div>
                </div>
              </header>

              <div 
                className="prose prose-invert prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content || '' }}
              />

              <footer className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground"></p>
                  <ShareButtons title={post.title} url={postUrl} />
                </div>
              </footer>
            </article>
          </div>
        </div>
      </div>
    </>
  )
}
