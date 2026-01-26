import { type NextRequest, NextResponse } from "next/server"

// In-memory storage as fallback when KV is not available
const memoryStore: Record<string, { likes: number; comments: any[] }> = {}

// Try to use KV if available, otherwise use in-memory storage
async function getKV() {
  try {
    // Only import KV if environment variables are set
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const { kv } = await import("@vercel/kv")
      return kv
    }
  } catch (error) {
    console.warn("KV not available, using in-memory storage:", error)
  }
  return null
}

async function getLikes(slug: string): Promise<number> {
  const kv = await getKV()
  if (kv) {
    try {
      return (await kv.get<number>(`likes:${slug}`)) || 0
    } catch (error) {
      console.warn("KV get error, using memory:", error)
    }
  }
  return memoryStore[slug]?.likes || 0
}

async function getComments(slug: string): Promise<any[]> {
  const kv = await getKV()
  if (kv) {
    try {
      const comments = await kv.lrange(`comments:${slug}`, 0, -1)
      return Array.isArray(comments) ? comments : []
    } catch (error) {
      console.warn("KV get error, using memory:", error)
    }
  }
  return memoryStore[slug]?.comments || []
}

async function incrementLikes(slug: string): Promise<number> {
  const kv = await getKV()
  if (kv) {
    try {
      return await kv.incr(`likes:${slug}`)
    } catch (error) {
      console.warn("KV incr error, using memory:", error)
    }
  }
  if (!memoryStore[slug]) {
    memoryStore[slug] = { likes: 0, comments: [] }
  }
  memoryStore[slug].likes = (memoryStore[slug].likes || 0) + 1
  return memoryStore[slug].likes
}

async function addComment(slug: string, comment: any): Promise<any[]> {
  const kv = await getKV()
  if (kv) {
    try {
      await kv.lpush(`comments:${slug}`, comment)
      const comments = await kv.lrange(`comments:${slug}`, 0, -1)
      return Array.isArray(comments) ? comments : []
    } catch (error) {
      console.warn("KV lpush error, using memory:", error)
    }
  }
  if (!memoryStore[slug]) {
    memoryStore[slug] = { likes: 0, comments: [] }
  }
  if (!memoryStore[slug].comments) {
    memoryStore[slug].comments = []
  }
  memoryStore[slug].comments.push(comment)
  return memoryStore[slug].comments
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const likes = await getLikes(slug)
    const comments = await getComments(slug)
    return NextResponse.json({ likes, comments })
  } catch (error) {
    console.error("Error fetching engagement:", error)
    return NextResponse.json({ likes: 0, comments: [] })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const { type, content, author } = await req.json()

    if (type === "like") {
      const likes = await incrementLikes(slug)
      return NextResponse.json({ likes })
    }

    if (type === "comment") {
      if (!content || !content.trim()) {
        return NextResponse.json({ error: "Comment content is required" }, { status: 400 })
      }
      const newComment = {
        id: Math.random().toString(36).substring(7),
        content: content.trim(),
        author: author || "Anonymous",
        date: new Date().toISOString(),
      }
      const comments = await addComment(slug, newComment)
      return NextResponse.json({ comments })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    console.error("Error posting engagement:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
