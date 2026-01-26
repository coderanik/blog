"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, User } from 'lucide-react'
import { login, setAuthToken } from '@/lib/auth'

// Hardcoded admin credentials (fallback)
const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME 
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      // Try to login via backend API first
      try {
        const response = await login(username, password)
        setAuthToken(response.token)
        localStorage.setItem('isAuthenticated', 'true')
        router.push('/dashboard')
        return
      } catch (apiError) {
        // If API login fails, fall back to hardcoded credentials
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
          // For hardcoded login, we still need a token for API calls
          // Set a flag and let the backend handle it, or use a dummy token
          // For now, we'll set isAuthenticated and let the user know they need backend auth
          localStorage.setItem('isAuthenticated', 'true')
          // Note: Without a real token, API calls will fail
          // This is a fallback for development only
          console.warn('Using hardcoded credentials. API calls may fail without backend authentication.')
          router.push('/dashboard')
          return
        }
        throw apiError
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid username or password')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-white">
      <div className="w-full max-w-md">
        <div className="bg-white border border-black p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-black mb-2 text-center">Admin Login</h1>
          <p className="text-sm md:text-base text-gray-600 text-center mb-6 md:mb-8 font-sans">Enter your credentials to access the dashboard</p>
          
          <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
            <div>
              <label htmlFor="username" className="block text-xs md:text-sm font-medium text-black mb-2 font-sans">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-3 bg-white border border-black text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-600 font-sans text-sm md:text-base"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs md:text-sm font-medium text-black mb-2 font-sans">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-3 bg-white border border-black text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-600 font-sans text-sm md:text-base"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-600 text-red-600 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-sans">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 md:py-3 border border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sans text-sm md:text-base"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

