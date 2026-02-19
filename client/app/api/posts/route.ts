import { NextResponse } from "next/server"
import { getAllPostsMeta } from "@/lib/content/posts"

export const dynamic = "force-static"
// Revalidate every hour to ensure fresh data
export const revalidate = 3600

export async function GET() {
  const posts = await getAllPostsMeta()
  return NextResponse.json(posts, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}

