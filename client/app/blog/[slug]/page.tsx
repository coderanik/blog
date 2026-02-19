import Link from "next/link"
import { notFound } from "next/navigation"
import { AnimatedNavbar } from "@/components/animated-navbar"
import { PostEngagement } from "@/components/post-engagement"
import { CopyLinkButton } from "@/components/copy-link-button"
import { getAllPostSlugs, getPostBySlug } from "@/lib/content/posts"

export const dynamicParams = true

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Tagline */}
        <div className="text-center pt-12 pb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-black font-sans font-light">
          EXPLORING SOFTWARE ARCHITECTURE, AI AND RESEARCH
          </p>
        </div>

        {/* Main Title */}
        <div className="text-center mb-0">
          <h1 className="text-6xl md:text-7xl lg:text-[110px] font-serif font-bold text-black pb-14">
            Engineering Insights
          </h1>
        </div>


        {/* Navigation Bar */}
        <div className="mb-8">
          <AnimatedNavbar />
        </div>


        {/* Main Content */}
        <div className="mb-16">
          {/* Blog Post Content */}
          <div className="max-w-4xl mx-auto">
            <article className="border border-black bg-gray-50">
              {/* Post Header */}
              <div className="relative p-8 pb-6">
                {/* Metadata - Top Left */}
                <div className="absolute top-8 left-8 text-sm text-gray-500 font-sans">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                  <span className="mx-2">·</span>
                  <span>{post.readTime}</span>
                </div>

                {/* Copy Link Button - Top Right */}
                <div className="absolute top-8 right-8">
                  <CopyLinkButton slug={slug} />
                </div>

                {/* Post Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-black mb-4 mt-12 leading-tight">
                  {post.title}
                </h1>

                {/* Post Subtitle/Description */}
                <p className="text-lg text-gray-700 font-sans leading-relaxed mb-6">
                  {post.description}
                </p>
              </div>

              {/* Featured Image */}
              {post.image ? (
                <div className="w-full relative bg-gray-200 flex items-center justify-center">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-auto max-h-[600px] object-contain" 
                  />
                </div>
              ) : (
                <div className="w-full h-96 bg-gray-200 relative overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-sm">Featured Image</span>
                  </div>
                </div>
              )}

              {/* Post Body */}
              <div className="p-8 pt-6">
                <div
                  className="blog-post-content font-sans text-gray-900"
                  style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}
                >
                  {post.content}
                </div>
              </div>
            </article>

            {/* Engagement Section */}
            <div className="max-w-4xl mx-auto mt-8">
              <PostEngagement slug={post.slug} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
