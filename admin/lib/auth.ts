const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api';

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    username: string;
    email?: string;
  };
}

export interface User {
  id: string;
  username: string;
  email?: string;
}

// Login
export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to login');
  }

  return response.json();
}

// Register (for initial setup)
export async function register(username: string, password: string, email?: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to register');
  }

  return response.json();
}

// Verify token
export async function verifyToken(token: string): Promise<{ success: boolean; user: User }> {
  const response = await fetch(`${API_URL}/auth/verify`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Invalid token');
  }

  return response.json();
}

// Token management
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
    localStorage.setItem('isAuthenticated', 'true');
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
  }
}

export function isAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    // Check for either authToken (backend auth) or isAuthenticated (hardcoded auth)
    return !!(localStorage.getItem('authToken') || localStorage.getItem('isAuthenticated'));
  }
  return false;
}

