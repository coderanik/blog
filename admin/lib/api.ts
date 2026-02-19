const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api';

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  return {
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

function getAuthHeadersWithJson(): HeadersInit {
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
  image?: string;
  tags: string[];
  date: string;
  readTime: string;
  status: 'published' | 'draft';
  featuredPost?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalClicks: number;
  topBlogsByViews: Array<{ _id: string; views: number }>;
  topBlogsByClicks: Array<{ _id: string; clicks: number }>;
  blogAnalytics: Array<{
    _id: { blogId: string | null; blogSlug: string };
    views: number;
    clicks: number;
  }>;
}

export interface PostMeta {
  _id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  tags: string[];
  image?: string;
  featuredPost?: boolean;
  featuredOrder?: number;
}

export interface EngagementItem {
  slug: string;
  likes: number;
  comments: Array<{ id: string; content: string; author: string; date: string }>;
  updatedAt: string;
}

export interface BlogAnalyticsDetail {
  blogSlug: string;
  views: number;
  clicks: number;
  viewsByTimezone: Array<{ _id: string; count: number }>;
  clicksByTimezone: Array<{ _id: string; count: number }>;
  viewsOverTime: Array<{ _id: string; count: number }>;
}

export interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

const CLIENT_URL = process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000';

// Posts from client (MDX) — no auth
export async function getPostsFromClient(): Promise<PostMeta[]> {
  const response = await fetch(`${CLIENT_URL}/api/posts`);
  if (!response.ok) return [];
  return response.json();
}

// Engagement (backend, auth)
export async function getEngagementList(): Promise<EngagementItem[]> {
  const response = await fetch(`${API_URL}/engagement/list/all`, {
    headers: getAuthHeadersWithJson(),
  });
  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('isAuthenticated');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return [];
  }
  return response.json();
}

// Contact submissions (backend, auth)
export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  const response = await fetch(`${API_URL}/contact/submissions`, {
    headers: getAuthHeadersWithJson(),
  });
  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('isAuthenticated');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    throw new Error('Failed to fetch contact submissions');
  }
  return response.json();
}

// Blog APIs (legacy — not used when posts are MDX)
export async function getAllBlogs(): Promise<Blog[]> {
  const response = await fetch(`${API_URL}/blogs`, {
    headers: getAuthHeadersWithJson(),
  });
  if (!response.ok) {
    // Don't redirect on database connection errors (503)
    if (response.status === 503) {
      throw new Error('Database connection unavailable. Please try again in a moment.');
    }
    if (response.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('isAuthenticated');
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
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
    headers: getAuthHeadersWithJson(),
  });
  if (!response.ok) {
    // Don't redirect on database connection errors (503)
    if (response.status === 503) {
      throw new Error('Database connection unavailable. Please try again in a moment.');
    }
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('isAuthenticated');
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
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
    headers: getAuthHeadersWithJson(),
    body: JSON.stringify(blog),
  });
  if (!response.ok) {
    // Don't redirect on database connection errors (503)
    if (response.status === 503) {
      throw new Error('Database connection unavailable. Please try again in a moment.');
    }
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('isAuthenticated');
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    throw new Error('Failed to create blog');
  }
  return response.json();
}

export async function updateBlog(id: string, blog: Partial<Blog>): Promise<Blog> {
  const response = await fetch(`${API_URL}/blogs/${id}`, {
    method: 'PUT',
    headers: getAuthHeadersWithJson(),
    body: JSON.stringify(blog),
  });
  if (!response.ok) {
    // Don't redirect on database connection errors (503)
    if (response.status === 503) {
      throw new Error('Database connection unavailable. Please try again in a moment.');
    }
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('isAuthenticated');
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    throw new Error('Failed to update blog');
  }
  return response.json();
}

export async function deleteBlog(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/blogs/${id}`, {
    method: 'DELETE',
    headers: getAuthHeadersWithJson(),
  });
  if (!response.ok) {
    // Don't redirect on database connection errors (503)
    if (response.status === 503) {
      throw new Error('Database connection unavailable. Please try again in a moment.');
    }
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('isAuthenticated');
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    throw new Error('Failed to delete blog');
  }
}

// Analytics APIs
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const response = await fetch(`${API_URL}/analytics/summary`, {
    headers: getAuthHeadersWithJson(),
  });
  if (!response.ok) {
    // Don't redirect on database connection errors (503)
    if (response.status === 503) {
      throw new Error('Database connection unavailable. Please try again in a moment.');
    }
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('isAuthenticated');
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    throw new Error('Failed to fetch analytics');
  }
  return response.json();
}

export async function getBlogAnalytics(slug: string): Promise<BlogAnalyticsDetail> {
  const response = await fetch(`${API_URL}/analytics/blog/${slug}`);
  if (!response.ok) throw new Error('Failed to fetch blog analytics');
  return response.json();
}

// Set featured post
export async function setFeaturedPost(id: string): Promise<Blog> {
  const response = await fetch(`${API_URL}/blogs/featured/${id}`, {
    method: 'POST',
    headers: getAuthHeadersWithJson(),
  });
  if (!response.ok) {
    // Don't redirect on database connection errors (503)
    if (response.status === 503) {
      throw new Error('Database connection unavailable. Please try again in a moment.');
    }
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('isAuthenticated');
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    throw new Error('Failed to set featured post');
  }
  return response.json();
}

// Upload image to Cloudinary
export async function uploadImage(file: File): Promise<{ url: string; public_id: string }> {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`${API_URL}/upload/image`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      // Handle database connection errors (503) without redirecting
      if (response.status === 503) {
        let errorMessage = 'Database connection unavailable';
        try {
          const error = await response.json();
          errorMessage = error.message || error.error || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage + '. Please wait a moment and try again.');
      }
      
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('isAuthenticated');
          // Only redirect if not already on login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        throw new Error('Authentication failed. Please login again.');
      }
      
      let errorMessage = 'Failed to upload image';
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to upload image. Please try again.');
  }
}

