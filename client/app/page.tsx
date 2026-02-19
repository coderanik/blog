import { getAllPostsMeta } from "@/lib/content/posts"
import { HomeClient } from "@/components/home-client"

export default async function HomePage() {
  const posts = await getAllPostsMeta()
  return <HomeClient initialPosts={posts} />
}
