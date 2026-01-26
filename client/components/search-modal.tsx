"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import Link from "next/link"
import { getAllPosts, type BlogPost } from "@/lib/blog-posts"
import { cn } from "@/lib/utils"

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("")
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch all posts when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      getAllPosts()
        .then((allPosts) => {
          setPosts(allPosts)
          setIsLoading(false)
        })
        .catch(() => {
          setIsLoading(false)
        })
      
      // Focus input when modal opens
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } else {
      // Reset search when modal closes
      setQuery("")
      setFilteredPosts([])
    }
  }, [isOpen])

  // Filter posts based on search query
  useEffect(() => {
    if (!query.trim()) {
      setFilteredPosts([])
      return
    }

    const searchTerm = query.toLowerCase().trim()
    const filtered = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.description.toLowerCase().includes(searchTerm) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
    )
    setFilteredPosts(filtered)
  }, [query, posts])

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl mx-4 mt-20 bg-gray-50 shadow-lg rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center border-b border-gray-300 px-4 py-3">
          <Search className="h-5 w-5 text-gray-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts by title, description, or tags..."
            className="flex-1 outline-none text-gray-900 font-sans placeholder-gray-400"
          />
          <button
            onClick={onClose}
            className="ml-3 p-1 hover:bg-gray-100 rounded transition-colors shrink-0"
            aria-label="Close search"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-8 text-center text-gray-500 font-sans">
              Loading posts...
            </div>
          ) : query.trim() ? (
            filteredPosts.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    onClick={onClose}
                    className="block px-4 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-serif font-semibold text-black mb-1 hover:text-purple-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 font-sans line-clamp-2 mb-2">
                      {post.description}
                    </p>
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-sans"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500 font-sans">
                No posts found matching &quot;{query}&quot;
              </div>
            )
          ) : (
            <div className="px-4 py-8 text-center text-gray-500 font-sans">
              Start typing to search posts...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
