import "server-only"

import fs from "node:fs/promises"
import path from "node:path"
import matter from "gray-matter"
import { cache } from "react"
import { compileMDX } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"

import { calculateReadingTime } from "@/lib/reading-time"
import Callout from "@/components/Callout"
import CodeBlock from "@/components/CodeBlock"

export type PostFrontmatter = {
  title: string
  description: string
  date: string
  tags?: string[]
  image?: string
  featured?: boolean
  featuredPost?: boolean
  featuredOrder?: number
  draft?: boolean
}

export interface PostMeta {
  _id: string
  slug: string
  title: string
  description: string
  date: string
  readTime: string
  tags: string[]
  image?: string
  featuredPost?: boolean
  featuredOrder?: number
}

export interface Post extends PostMeta {
  content: React.ReactElement
}

const POST_EXTENSIONS = [".mdx", ".md"] as const

let cachedPostsDir: string | null = null

async function getPostsDir(): Promise<string> {
  if (cachedPostsDir) return cachedPostsDir
  const cwd = process.cwd()
  const candidates = [
    path.join(cwd, "content", "posts"),
    path.join(cwd, "client", "content", "posts"),
  ]
  for (const dir of candidates) {
    try {
      await fs.access(dir)
      cachedPostsDir = dir
      return dir
    } catch {
      continue
    }
  }
  cachedPostsDir = path.join(cwd, "content", "posts")
  return cachedPostsDir
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

function normalizeSlug(filename: string): string {
  // Remove extension first
  const withoutExt = filename.replace(/\.(md|mdx)$/i, "")
  // Normalize to URL-safe slug: lowercase, replace special chars with nothing, trim
  return withoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^-+|-+$/g, "")
}

async function resolvePostFilePath(slug: string): Promise<string | null> {
  const postsDir = await getPostsDir()
  
  // First try exact match
  for (const ext of POST_EXTENSIONS) {
    const p = path.join(postsDir, `${slug}${ext}`)
    // eslint-disable-next-line no-await-in-loop
    if (await fileExists(p)) return p
  }
  
  // If exact match fails, try to find file by normalized slug match
  // This handles cases where filename has special chars but URL slug is normalized
  try {
    const entries = await fs.readdir(postsDir, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isFile()) continue
      if (!POST_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) continue
      
      const normalizedFilename = normalizeSlug(entry.name)
      const normalizedSlug = normalizeSlug(slug)
      
      if (normalizedFilename === normalizedSlug) {
        return path.join(postsDir, entry.name)
      }
    }
  } catch {
    // If readdir fails, just return null
  }
  
  return null
}

function normalizeTags(tags: unknown): string[] {
  if (!tags) return []
  if (Array.isArray(tags)) return tags.map(String).filter(Boolean)
  return String(tags)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
}

function toIsoDate(input: unknown): string {
  const str = String(input || "").trim()
  if (!str) return new Date().toISOString()
  const d = new Date(str)
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
}

function buildMeta(slug: string, fm: Partial<PostFrontmatter>, body: string): PostMeta {
  const title = String(fm.title || slug)
  const description = String(fm.description || "")
  const date = toIsoDate(fm.date)
  const tags = normalizeTags(fm.tags)
  const image = fm.image ? String(fm.image) : undefined
  const featuredPost = Boolean(fm.featured ?? fm.featuredPost)
  const featuredOrder =
    typeof fm.featuredOrder === "number" ? fm.featuredOrder : fm.featuredOrder ? Number(fm.featuredOrder) : undefined

  return {
    _id: slug,
    slug,
    title,
    description,
    date,
    readTime: calculateReadingTime(body),
    tags,
    image,
    featuredPost,
    featuredOrder,
  }
}

export const getAllPostSlugs = cache(async (): Promise<string[]> => {
  const postsDir = await getPostsDir()
  const entries = await fs.readdir(postsDir, { withFileTypes: true }).catch(() => [])
  return entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => POST_EXTENSIONS.some((ext) => name.endsWith(ext)))
    .map((name) => normalizeSlug(name))
})

export const getAllPostsMeta = cache(async (): Promise<PostMeta[]> => {
  const slugs = await getAllPostSlugs()
  const metas: PostMeta[] = []

  for (const slug of slugs) {
    // eslint-disable-next-line no-await-in-loop
    const filePath = await resolvePostFilePath(slug)
    if (!filePath) continue

    // eslint-disable-next-line no-await-in-loop
    const raw = await fs.readFile(filePath, "utf8")
    const parsed = matter(raw)
    const fm = (parsed.data || {}) as Partial<PostFrontmatter>

    if (fm.draft) continue
    metas.push(buildMeta(slug, fm, parsed.content || ""))
  }

  metas.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return metas
})

export const getFeaturedPostsMeta = cache(async (limit = 1): Promise<PostMeta[]> => {
  const all = await getAllPostsMeta()
  const featured = all.filter((p) => p.featuredPost)
  featured.sort((a, b) => (a.featuredOrder ?? 9999) - (b.featuredOrder ?? 9999) || new Date(b.date).getTime() - new Date(a.date).getTime())
  return featured.slice(0, limit)
})

export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  const filePath = await resolvePostFilePath(slug)
  if (!filePath) return null

  const source = await fs.readFile(filePath, "utf8")
  const parsed = matter(source)
  
  // Remove import statements from MDX source (next-mdx-remote doesn't support them)
  const cleanedSource = source.replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, '')
  
  const compiled = await compileMDX<PostFrontmatter>({
    source: cleanedSource,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [
            // Wrap headings in anchor links; useful for TOC / sharing.
            rehypeAutolinkHeadings,
            { behavior: "wrap" },
          ],
        ],
      },
    },
    components: {
      Callout,
      CodeBlock,
    },
  })

  const fm = compiled.frontmatter || ({} as PostFrontmatter)
  const meta = buildMeta(slug, fm, parsed.content || "")
  if (fm.draft) return null

  return {
    ...meta,
    content: compiled.content,
  }
})

