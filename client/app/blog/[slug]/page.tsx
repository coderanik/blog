"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Calendar, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getPostBySlug, trackClick } from "@/lib/blog-posts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ReadingProgress } from "@/components/reading-progress"
import { TableOfContents } from "@/components/table-of-contents"
import { ShareButtons } from "@/components/share-buttons"
import { PostEngagement } from "@/components/post-engagement"
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

  return (
    <>
      <ReadingProgress />
      <div className="py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <Link href="/">
            <Button variant="ghost" className="mb-8 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
            <article className="max-w-3xl">
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
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </header>

              <div 
                className="prose prose-invert prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content || '' }}
              />

              <footer className="mt-12 pt-8 border-t border-white/10">
                <div className="flex items-center justify-between mb-12">
                  <p className="text-sm text-muted-foreground">Share this article:</p>
                  <ShareButtons title={post.title} url={postUrl} />
                </div>

                <PostEngagement slug={slug} />
              </footer>
            </article>

            <aside className="hidden lg:block">
              <TableOfContents />
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}
