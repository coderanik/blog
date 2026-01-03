"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Heart, MessageSquare, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

  useEffect(() => {
    fetch(`/api/engagement/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setLikes(data.likes)
        setComments(data.comments)
      })
  }, [slug])

  const handleLike = async () => {
    if (isLiked) return
    setIsLiked(true)
    setLikes((prev) => prev + 1)
    await fetch(`/api/engagement/${slug}`, {
      method: "POST",
      body: JSON.stringify({ type: "like" }),
    })
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    const res = await fetch(`/api/engagement/${slug}`, {
      method: "POST",
      body: JSON.stringify({ type: "comment", content: newComment }),
    })
    const data = await res.json()
    setComments(data.comments)
    setNewComment("")
    setIsSubmitting(false)
  }

  return (
    <div className="mt-16 space-y-12">
      <div className="flex items-center gap-6 border-y border-white/5 py-6">
        <button
          onClick={handleLike}
          className={cn(
            "flex items-center gap-2 text-sm font-medium transition-colors group",
            isLiked ? "text-red-500" : "text-muted-foreground hover:text-white",
          )}
        >
          <motion.div whileTap={{ scale: 1.5 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
            <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
          </motion.div>
          <span>{likes} Likes</span>
        </button>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <MessageSquare className="h-5 w-5" />
          <span>{comments.length} Comments</span>
        </div>
      </div>

      {/* <div className="space-y-8">
        <h3 className="text-xl font-bold tracking-tight">Discussion</h3>

        <form onSubmit={handleComment} className="flex gap-4">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a thought..."
            className="bg-white/5 border-white/10 rounded-none focus-visible:ring-white/20"
          />
          <Button type="submit" disabled={isSubmitting} className="rounded-none bg-white text-black hover:bg-white/90">
            <Send className="h-4 w-4" />
          </Button>
        </form>

        <div className="space-y-6">
          <AnimatePresence initial={false}>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2 border-l-2 border-white/5 pl-4"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-bold text-white">{comment.author}</span>
                  <span>•</span>
                  <span>{new Date(comment.date).toLocaleDateString()}</span>
                </div>
                <p className="text-sm leading-relaxed">{comment.content}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div> */}
    </div>
  )
}
