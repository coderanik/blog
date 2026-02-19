"use client"

import { useEffect } from "react"
import { trackView } from "@/lib/backend-api"

export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    if (slug) trackView(slug)
  }, [slug])
  return null
}
