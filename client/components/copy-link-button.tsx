"use client"

import { useState } from "react"
import { Link2, Check } from "lucide-react"

interface CopyLinkButtonProps {
  slug: string
  className?: string
}

export function CopyLinkButton({ slug, className = "" }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      // Construct the full URL using the current origin
      const url = `${window.location.origin}/blog/${slug}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy link:", error)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`text-gray-500 hover:text-gray-700 transition-colors ${className}`}
      title={copied ? "Link copied!" : "Copy link"}
      aria-label="Copy link to this post"
    >
      {copied ? (
        <Check className="h-5 w-5 text-green-600" />
      ) : (
        <Link2 className="h-5 w-5" />
      )}
    </button>
  )
}
