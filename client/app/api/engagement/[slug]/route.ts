import { type NextRequest, NextResponse } from "next/server"
import { kv } from "@vercel/kv"

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const likes = (await kv.get<number>(`likes:${slug}`)) || 0
  const comments = (await kv.get<any[]>(`comments:${slug}`)) || []

  return NextResponse.json({ likes, comments })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { type, content, author } = await req.json()

  if (type === "like") {
    const likes = await kv.incr(`likes:${slug}`)
    return NextResponse.json({ likes })
  }

  if (type === "comment") {
    const newComment = {
      id: Math.random().toString(36).substring(7),
      content,
      author: author || "Anonymous",
      date: new Date().toISOString(),
    }
    await kv.lpush(`comments:${slug}`, newComment)
    const comments = await kv.lrange(`comments:${slug}`, 0, -1)
    return NextResponse.json({ comments })
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 })
}
