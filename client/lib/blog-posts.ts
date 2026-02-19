import type { BlogPost } from "@/lib/post-types"
export type { BlogPost } from "@/lib/post-types"

let cachedPosts: BlogPost[] | null = null

export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    if (cachedPosts) return cachedPosts
    const response = await fetch("/api/posts")
    if (!response.ok) throw new Error("Failed to fetch posts")
    const posts = (await response.json()) as BlogPost[]
    cachedPosts = posts
    return cachedPosts
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return []
  }
}

export async function getFeaturedPosts(limit = 1): Promise<BlogPost[]> {
  const posts = await getAllPosts()
  const featured = posts
    .filter((p) => p.featuredPost)
    .sort(
      (a, b) =>
        (a.featuredOrder ?? 9999) - (b.featuredOrder ?? 9999) ||
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
  return featured.slice(0, limit)
}
