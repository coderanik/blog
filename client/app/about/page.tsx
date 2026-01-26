"use client"

import { AnimatedNavbar } from "@/components/animated-navbar"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Tagline */}
        <div className="text-center pt-12 pb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-sans font-light">
          EXPLORING SOFTWARE ARCHITECTURE, AI AND RESEARCH
          </p>
        </div>

        {/* Main Title */}
        <div className="text-center mb-10">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-black">
            Engineering Insights
          </h1>
        </div>


        {/* Navigation Bar */}
        <div className="mb-10">
          <AnimatedNavbar />
        </div>


        {/* About Me Content */}
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-sm uppercase tracking-[0.3em] font-sans font-semibold text-black mb-6 text-center">
            ABOUT ME
          </h2>
          
          {/* Profile Picture */}
          <div className="w-32 h-32 mx-auto mb-6 border-2 border-black relative overflow-hidden bg-gray-200">
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              Photo
            </div>
          </div>
          
          {/* About Text */}
          <p className="text-sm text-gray-700 font-sans leading-relaxed mb-4 text-center">
            I'm a paragraph. Click here to add your own text and edit me. It's easy. Just click "Edit Text" or double click me to add your own content and make changes to the font. I'm a great place for you to tell a story and let your users know a little more about you.
          </p>
        </div>
      </div>
    </div>
  )
}
