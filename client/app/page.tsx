"use client"

import { useState, useMemo, useEffect } from "react"
import { BlogCard } from "@/components/blog-card"
import { TagFilter } from "@/components/tag-filter"
import { getAllPosts, type BlogPost } from "@/lib/blog-posts"
import { motion } from "framer-motion"

export default function HomePage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [allPosts, setAllPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const posts = await getAllPosts()
        setAllPosts(posts)
      } catch (error) {
        console.error('Failed to fetch posts:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    allPosts.forEach((post) => {
      post.tags.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [allPosts])

  const filteredPosts = useMemo(() => {
    if (!selectedTag) return allPosts
    return allPosts.filter((post) => post.tags.includes(selectedTag))
  }, [allPosts, selectedTag])

  if (loading) {
    return (
      <div className="py-24 px-6 min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="py-24 px-6 min-h-screen">
      <div className="container mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter">Engineering Insights.</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          Exploring software architecture, AI, and research problems.
          </p>
          <TagFilter tags={allTags} selectedTag={selectedTag} onTagSelect={setSelectedTag} />
        </motion.div>

        {/* <CHANGE> Changed grid to single column layout for all screen sizes */}
        <div className="grid grid-cols-1 gap-y-16">
          {filteredPosts.length === 0 ? (
            <div className="text-center text-muted-foreground">No posts found</div>
          ) : (
            filteredPosts.map((post, index) => (
              <BlogCard key={post.slug} post={post} index={index} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
