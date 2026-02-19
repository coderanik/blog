"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Calendar, Clock } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { trackClick } from "@/lib/blog-posts"
import type { BlogPost } from "@/lib/blog-posts"

interface BlogCardProps {
  post: BlogPost
  index?: number
}

export function BlogCard({ post, index = 0 }: BlogCardProps) {
  const handleClick = () => {
    trackClick(post.slug)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Link href={`/blog/${post.slug}`} onClick={handleClick}>
        <Card className="glass border-white/10 hover:border-primary/50 transition-all duration-300 h-full group">
          <CardHeader>
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors text-balance">
              {post.title}
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 leading-relaxed text-pretty">{post.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
