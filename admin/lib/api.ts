const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api';

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  tags: string[];
  date: string;
  readTime: string;
  status: 'published' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalClicks: number;
  topBlogsByViews: Array<{ _id: string; views: number }>;
  topBlogsByClicks: Array<{ _id: string; clicks: number }>;
  blogAnalytics: Array<{
    _id: { blogId: string; blogSlug: string };
    views: number;
    clicks: number;
  }>;
}

// Blog APIs
export async function getAllBlogs(): Promise<Blog[]> {
  const response = await fetch(`${API_URL}/blogs`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/login';
      }
    }
    throw new Error('Failed to fetch blogs');
  }
  return response.json();
}

export async function getPublishedBlogs(): Promise<Blog[]> {
  const response = await fetch(`${API_URL}/blogs/published`);
  if (!response.ok) throw new Error('Failed to fetch published blogs');
  return response.json();
}

export async function getDrafts(): Promise<Blog[]> {
  const response = await fetch(`${API_URL}/blogs/drafts/all`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/login';
      }
    }
    throw new Error('Failed to fetch drafts');
  }
  return response.json();
}

export async function getBlogBySlug(slug: string): Promise<Blog> {
  const response = await fetch(`${API_URL}/blogs/${slug}`);
  if (!response.ok) throw new Error('Failed to fetch blog');
  return response.json();
}

export async function getBlogById(id: string): Promise<Blog> {
  const response = await fetch(`${API_URL}/blogs/id/${id}`);
  if (!response.ok) throw new Error('Failed to fetch blog');
  return response.json();
}

export async function createBlog(blog: Partial<Blog>): Promise<Blog> {
  const response = await fetch(`${API_URL}/blogs`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(blog),
  });
  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/login';
      }
    }
    throw new Error('Failed to create blog');
  }
  return response.json();
}

export async function updateBlog(id: string, blog: Partial<Blog>): Promise<Blog> {
  const response = await fetch(`${API_URL}/blogs/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(blog),
  });
  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/login';
      }
    }
    throw new Error('Failed to update blog');
  }
  return response.json();
}

export async function deleteBlog(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/blogs/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/login';
      }
    }
    throw new Error('Failed to delete blog');
  }
}

// Analytics APIs
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const response = await fetch(`${API_URL}/analytics/summary`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/login';
      }
    }
    throw new Error('Failed to fetch analytics');
  }
  return response.json();
}

export async function getBlogAnalytics(slug: string) {
  const response = await fetch(`${API_URL}/analytics/blog/${slug}`);
  if (!response.ok) throw new Error('Failed to fetch blog analytics');
  return response.json();
}

