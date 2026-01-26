"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Heart, MessageSquare, Send } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

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
        const res = await fetch(`/api/engagement/${slug}`)
        const data = await res.json()
        setLikes(data.likes || 0)
        setComments(data.comments || [])
      } catch (error) {
        console.error("Failed to fetch engagement:", error)
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
      await fetch(`/api/engagement/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "like" }),
      })
    } catch (error) {
      console.error("Failed to like:", error)
      setLikes((prev) => prev - 1)
      setIsLiked(false)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/engagement/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "comment", content: newComment }),
      })
      const data = await res.json()
      if (data.comments) {
        setComments(data.comments)
        setNewComment("")
      }
    } catch (error) {
      console.error("Failed to post comment:", error)
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
