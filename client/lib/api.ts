const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api';

export interface BlogPost {
  _id: string;
  slug: string;
  title: string;
  description: string;
  content?: string;
  image?: string;
  date: string;
  readTime: string;
  tags: string[];
  status: 'published' | 'draft';
  featuredPost?: boolean;
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const response = await fetch(`${API_URL}/blogs/published`);
  if (!response.ok) throw new Error('Failed to fetch blogs');
  return response.json();
}

export async function getPostBySlug(slug: string): Promise<BlogPost> {
  const response = await fetch(`${API_URL}/blogs/${slug}`);
  if (!response.ok) throw new Error('Failed to fetch blog');
  return response.json();
}


