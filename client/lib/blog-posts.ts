import { getAllPosts as fetchAllPosts, getPostBySlug as fetchPostBySlug, trackView, trackClick } from './api'

export interface BlogPost {
  _id: string
  slug: string
  title: string
  description: string
  date: string
  readTime: string
  tags: string[]
  content?: string
  status?: 'published' | 'draft'
}

let cachedPosts: BlogPost[] | null = null

export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    if (cachedPosts) return cachedPosts
    const posts = await fetchAllPosts()
    cachedPosts = posts
    return posts
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  try {
    const post = await fetchPostBySlug(slug)
    // Track view when post is opened
    trackView(slug)
    return post
  } catch (error) {
    console.error('Failed to fetch post:', error)
    return undefined
  }
}

export function getFeaturedPosts(): BlogPost[] {
  // For now, return first 3 posts as featured
  // You can add a featured field to the blog model later
  return []
}

// Re-export tracking functions
export { trackClick } from './api'
