import { NextResponse } from "next/server"
import { getAllPostsMeta } from "@/lib/content/posts"

/**
 * GET /api/verify-posts
 * Returns post count, slugs, and duplicate check for deployment verification.
 * Use after deploy: curl https://myblog.anikdas.me/api/verify-posts
 */
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const posts = await getAllPostsMeta()
    const slugs = posts.map((p) => p.slug.toLowerCase())
    const duplicateSlugs = slugs.filter((s, i) => slugs.indexOf(s) !== i)
    const fasterRelated = posts.filter(
      (p) =>
        p.slug.toLowerCase().includes("faster") ||
        p.title.toLowerCase().includes("faster")
    )

    const ok =
      duplicateSlugs.length === 0 &&
      fasterRelated.length <= 1

    return NextResponse.json(
      {
        ok,
        totalPosts: posts.length,
        slugs: posts.map((p) => ({ slug: p.slug, title: p.title })),
        duplicateSlugs: [...new Set(duplicateSlugs)],
        fasterRelatedCount: fasterRelated.length,
        fasterRelated: fasterRelated.map((p) => ({ slug: p.slug, title: p.title })),
      },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    )
  }
}
