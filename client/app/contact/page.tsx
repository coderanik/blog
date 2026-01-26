"use client"

import { useState } from "react"
import { AnimatedNavbar } from "@/components/animated-navbar"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit form')
      }

      // Success
      setSubmitted(true)
      setFormData({ name: "", email: "", subject: "", message: "" })
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false)
      }, 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit form. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-9xl mx-auto px-6">
        {/* Tagline */}
        <div className="text-center pt-12 pb-6">
          <p className="text-xl uppercase tracking-[0.2em] text-black font-sans font-light">
          EXPLORING SOFTWARE ARCHITECTURE, AI AND RESEARCH
          </p>
        </div>

        {/* Main Title */}
        <div className="text-center mb-0">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-black pb-14">
            Engineering Insights
          </h1>
        </div>


        {/* Navigation Bar */}
        <div className="mb-10">
          <AnimatedNavbar />
        </div>


        {/* Contact Form */}
        <div className="max-w-2xl mx-auto mb-16 px-4 md:px-8 lg:px-16 border border-black rounded-lg py-8 md:py-10 bg-gray-50">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-black mb-6 md:mb-8 text-center">
            Get in Touch
          </h2>

          {submitted && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-sans text-sm">
                Thank you for your message! I'll get back to you soon.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-sans text-sm">
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 font-sans mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-black bg-gray-50 text-gray-900 font-sans focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-600"
                placeholder="Your name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 font-sans mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-black bg-gray-50 text-gray-900 font-sans focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-600"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 font-sans mb-2">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-black bg-gray-50 text-gray-900 font-sans focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-600"
                placeholder="What's this about?"
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 font-sans mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-black bg-gray-50 text-gray-900 font-sans focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-600 resize-none"
                placeholder="Your message here..."
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-purple-600 text-white font-sans font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
