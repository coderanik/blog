import { getAllPostsMeta } from "@/lib/content/posts"
import { MyBlogClient } from "@/components/myblog-client"

export default async function MyBlogPage() {
  const posts = await getAllPostsMeta()
  return <MyBlogClient initialPosts={posts} />
}
