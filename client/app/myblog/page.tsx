import { getAllPostsMeta } from "@/lib/content/posts"
import { MyBlogClient } from "@/components/myblog-client"

// Revalidate every hour
export const revalidate = 3600

export default async function MyBlogPage() {
  const posts = await getAllPostsMeta()
  return <MyBlogClient initialPosts={posts} />
}
