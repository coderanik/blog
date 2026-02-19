import { getAllPostsMeta } from "@/lib/content/posts"
import { HomeClient } from "@/components/home-client"

// Revalidate every hour
export const revalidate = 3600

export default async function HomePage() {
  const posts = await getAllPostsMeta()
  return <HomeClient initialPosts={posts} />
}
