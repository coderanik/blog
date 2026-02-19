"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'
import { getContactSubmissions, type ContactSubmission } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

export default function ContactSubmissionsPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    getContactSubmissions()
      .then(setSubmissions)
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-white">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 bg-white min-h-screen pt-16 md:pt-8">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-sans text-gray-600 hover:text-purple-600 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-black flex items-center gap-2">
          <Mail className="h-8 w-8" />
          Contact submissions
        </h1>
        <p className="text-sm text-gray-600 font-sans mt-1">
          {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-4">
        {submissions.length === 0 ? (
          <div className="text-center py-12 text-gray-600 font-sans">No submissions yet.</div>
        ) : (
          submissions.map((s) => (
            <div
              key={s._id}
              className="border border-black p-4 md:p-6 hover:border-purple-600 transition-colors"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-600 font-sans mb-2">
                <span className="font-semibold text-black">{s.name}</span>
                <span>·</span>
                <a href={`mailto:${s.email}`} className="text-purple-600 hover:underline">
                  {s.email}
                </a>
                <span>·</span>
                <time dateTime={s.createdAt}>
                  {new Date(s.createdAt).toLocaleString()}
                </time>
              </div>
              <h3 className="text-base font-serif font-semibold text-black mb-2">{s.subject}</h3>
              <p className="text-sm font-sans text-gray-800 whitespace-pre-wrap">{s.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
