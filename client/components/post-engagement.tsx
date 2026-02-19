"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Heart, MessageSquare, Send } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { BACKEND_API_URL } from "@/lib/backend-api"

interface Comment {
  id: string
  content: string
  author: string
  date: string
}

export function PostEngagement({ slug }: { slug: string }) {
  const [likes, setLikes] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLiked, setIsLiked] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEngagement() {
      try {
        const encodedSlug = encodeURIComponent(slug)
        const res = await fetch(`${BACKEND_API_URL}/engagement/${encodedSlug}`)
        
        if (!res.ok) {
          // Silently fail - engagement is non-critical
          setLikes(0)
          setComments([])
          setLoading(false)
          return
        }
        
        const data = await res.json()
        setLikes(data.likes ?? 0)
        setComments(Array.isArray(data.comments) ? data.comments : [])
      } catch (error) {
        // Silently fail - engagement is non-critical
        // Only log in development
        if (process.env.NODE_ENV === "development") {
          console.warn("Failed to fetch engagement:", error)
        }
        setLikes(0)
        setComments([])
      } finally {
        setLoading(false)
      }
    }
    fetchEngagement()
  }, [slug])

  const handleLike = async () => {
    if (isLiked) return
    setIsLiked(true)
    setLikes((prev) => prev + 1)
    try {
      const encodedSlug = encodeURIComponent(slug)
      const res = await fetch(`${BACKEND_API_URL}/engagement/${encodedSlug}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      
      if (!res.ok) {
        // Revert optimistic update if request failed
        setLikes((prev) => prev - 1)
        setIsLiked(false)
        return
      }
      
      const data = await res.json()
      if (typeof data.likes === "number") setLikes(data.likes)
    } catch (error) {
      // Revert optimistic update on error
      setLikes((prev) => prev - 1)
      setIsLiked(false)
      if (process.env.NODE_ENV === "development") {
        console.warn("Failed to like:", error)
      }
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    const commentToAdd = newComment.trim()
    
    // Optimistically add comment
    const optimisticComment: Comment = {
      id: `temp-${Date.now()}`,
      content: commentToAdd,
      author: "Anonymous",
      date: new Date().toISOString(),
    }
    setComments((prev) => [...prev, optimisticComment])
    setNewComment("")

    try {
      const encodedSlug = encodeURIComponent(slug)
      const res = await fetch(`${BACKEND_API_URL}/engagement/${encodedSlug}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentToAdd }),
      })
      
      if (!res.ok) {
        // Remove optimistic comment if request failed
        setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id))
        setNewComment(commentToAdd) // Restore comment text
        return
      }
      
      const data = await res.json()
      if (Array.isArray(data.comments)) {
        setComments(data.comments)
      }
    } catch (error) {
      // Remove optimistic comment on error
      setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id))
      setNewComment(commentToAdd) // Restore comment text
      if (process.env.NODE_ENV === "development") {
        console.warn("Failed to post comment:", error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <div className="mt-16 text-center text-gray-600 font-sans">Loading...</div>
  }

  return (
    <div className="mt-16 space-y-8 border-t border-black pt-8">
      <div className="flex items-center gap-6 border-b border-black pb-6">
        <button
          onClick={handleLike}
          className={cn(
            "flex items-center gap-2 text-sm font-medium transition-colors font-sans",
            isLiked ? "text-red-600" : "text-gray-600 hover:text-purple-600",
          )}
        >
          <motion.div whileTap={{ scale: 1.2 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
            <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
          </motion.div>
          <span>{likes} {likes === 1 ? 'Like' : 'Likes'}</span>
        </button>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 font-sans">
          <MessageSquare className="h-5 w-5" />
          <span>{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</span>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-serif font-bold text-black">Discussion</h3>

        <form onSubmit={handleComment} className="flex gap-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-4 py-2 bg-gray-50 border border-black text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-600 font-sans"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 border border-black text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sans flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </form>

        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {comments.length === 0 ? (
              <p className="text-gray-500 font-sans text-sm">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2 border-l-2 border-purple-600 pl-4 py-2"
                >
                  <div className="flex items-center gap-2 text-xs text-gray-600 font-sans">
                    <span className="font-semibold text-black">{comment.author}</span>
                    <span>•</span>
                    <span>{new Date(comment.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-900 font-sans whitespace-pre-wrap">{comment.content}</p>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
