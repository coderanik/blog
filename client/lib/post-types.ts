export interface BlogPost {
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

