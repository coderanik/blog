import { NextResponse } from "next/server"
import { getAllPostsMeta } from "@/lib/content/posts"

export const dynamic = "force-static"

export async function GET() {
  const posts = await getAllPostsMeta()
  return NextResponse.json(posts)
}

