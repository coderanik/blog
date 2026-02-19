import "server-only"

import fs from "node:fs/promises"
import path from "node:path"
import matter from "gray-matter"
import { cache } from "react"
import { compileMDX } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import { rehypeTableWrapper } from "@/lib/rehype-table-wrapper"

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
  /** Custom slug for URL (e.g. "which-is-faster-include-vs-import"). If omitted, derived from title. */
  slug?: string
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
    path.join(cwd, "..", "client", "content", "posts"),
  ]
  for (const dir of candidates) {
    try {
      const resolved = path.resolve(dir)
      await fs.access(resolved)
      cachedPostsDir = resolved
      return resolved
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

/** Convert title (or any text) to a URL-safe slug with hyphens */
function slugifyTitle(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars except spaces and hyphens
    .replace(/\s+/g, "-") // Spaces to hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-|-$/g, "") // Trim hyphens
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

function buildMeta(
  fileSlug: string,
  urlSlug: string,
  fm: Partial<PostFrontmatter>,
  body: string
): PostMeta {
  const title = String(fm.title || fileSlug)
  const description = String(fm.description || "")
  const date = toIsoDate(fm.date)
  const tags = normalizeTags(fm.tags)
  const image = fm.image ? String(fm.image) : undefined
  const featuredPost = Boolean(fm.featured ?? fm.featuredPost)
  const featuredOrder =
    typeof fm.featuredOrder === "number" ? fm.featuredOrder : fm.featuredOrder ? Number(fm.featuredOrder) : undefined

  return {
    _id: urlSlug,
    slug: urlSlug,
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
  const metas = await getAllPostsMeta()
  return metas.map((m) => m.slug)
})

export const getAllPostsMeta = cache(async (): Promise<PostMeta[]> => {
  const postsDir = await getPostsDir()
  const entries = await fs.readdir(postsDir, { withFileTypes: true }).catch(() => [])
  const files = entries
    .filter((e) => e.isFile())
    .filter((e) => POST_EXTENSIONS.some((ext) => e.name.endsWith(ext)))
    .filter((e) => !e.name.startsWith("_")) // Skip templates (e.g. _template.mdx)
  
  const metas: PostMeta[] = []
  const seenUrlSlugs = new Set<string>()

  for (const entry of files) {
    const fileSlug = normalizeSlug(entry.name)
    const filePath = path.join(postsDir, entry.name)

    // eslint-disable-next-line no-await-in-loop
    const raw = await fs.readFile(filePath, "utf8")
    const parsed = matter(raw)
    const fm = (parsed.data || {}) as Partial<PostFrontmatter>

    if (fm.draft) continue

    // URL slug: frontmatter slug > slugify(title) > file slug
    const urlSlug = fm.slug
      ? slugifyTitle(fm.slug)
      : fm.title
        ? slugifyTitle(fm.title)
        : fileSlug

    if (seenUrlSlugs.has(urlSlug)) continue
    seenUrlSlugs.add(urlSlug)

    metas.push(buildMeta(fileSlug, urlSlug, fm, parsed.content || ""))
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

async function resolvePostByUrlSlug(urlSlug: string): Promise<string | null> {
  // First try file-based resolution (for backward compatibility: /blog/faster)
  const byFile = await resolvePostFilePath(urlSlug)
  if (byFile) return byFile

  // Then try to find by computing URL slug from each file's frontmatter
  const postsDir = await getPostsDir()
  const entries = await fs.readdir(postsDir, { withFileTypes: true }).catch(() => [])
  const normalizedUrlSlug = slugifyTitle(urlSlug)

  for (const entry of entries) {
    if (!entry.isFile() || !POST_EXTENSIONS.some((ext) => entry.name.endsWith(ext)) || entry.name.startsWith("_")) continue
    const filePath = path.join(postsDir, entry.name)
    const raw = await fs.readFile(filePath, "utf8")
    const parsed = matter(raw)
    const fm = (parsed.data || {}) as Partial<PostFrontmatter>
    const fileSlug = normalizeSlug(entry.name)
    const computedSlug = fm.slug
      ? slugifyTitle(fm.slug)
      : fm.title
        ? slugifyTitle(fm.title)
        : fileSlug
    if (computedSlug === normalizedUrlSlug) return filePath
  }
  return null
}

export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  const filePath = await resolvePostByUrlSlug(slug)
  if (!filePath) return null

  const source = await fs.readFile(filePath, "utf8")
  const parsed = matter(source)
  const fm = (parsed.data || {}) as Partial<PostFrontmatter>
  const fileSlug = normalizeSlug(path.basename(filePath, path.extname(filePath)))

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
            rehypeAutolinkHeadings,
            { behavior: "wrap" },
          ],
          rehypeTableWrapper,
        ],
      },
    },
    components: {
      Callout,
      CodeBlock,
    },
  })

  const compiledFm = compiled.frontmatter || ({} as PostFrontmatter)
  if (compiledFm.draft) return null

  const urlSlug = compiledFm.slug
    ? slugifyTitle(compiledFm.slug)
    : compiledFm.title
      ? slugifyTitle(compiledFm.title)
      : fileSlug
  const meta = buildMeta(fileSlug, urlSlug, compiledFm, parsed.content || "")

  return {
    ...meta,
    content: compiled.content,
  }
})

