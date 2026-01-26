"use client"

import { AnimatedNavbar } from "@/components/animated-navbar"
import Link from "next/link"
import Image from "next/image"

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
          <div className="w-64 h-64 mx-auto mb-6 border-2 border-black relative overflow-hidden bg-gray-200 rounded-full">
            <Image
              src="/photo.jpeg"
              alt="Profile photo"
              fill
              className="object-cover"
            />
          </div>
          
          {/* About Text */}
          <p className="text-sm text-gray-700 font-sans leading-relaxed mb-4 text-center">
          I am a 2nd-year B.Tech undergraduate student from India, working as a Full Stack Developer, Freelancer, Researcher, Open Source Contributor, and Technical Blogger. I have a strong foundation in software engineering and specialize in building scalable, secure, and user-centric applications that solve real-world problems. My technical skill set includes Python, Java, and JavaScript, along with modern frameworks, backend systems, APIs, and databases.
          <br />
          I am deeply interested in the integration of artificial intelligence into practical software systems, with a particular focus on computer vision and natural language processing. I actively explore how AI-driven solutions can enhance automation, decision-making, and user experience in real-world applications. Alongside development, I engage in research-oriented problem solving, experimenting with emerging technologies and contributing to open-source projects that emphasize clean architecture, performance, and reliability.
          <br />
          As a freelancer, I have experience collaborating with clients and teams to design, develop, and deploy end-to-end solutions, ensuring quality, scalability, and maintainability. As a blogger, I regularly share insights on software engineering, full stack development, AI, and system design, with the goal of making complex concepts accessible and practical for a broader audience.
          <br />
          I am highly motivated by challenging problems and committed to continuous learning, technical excellence, and professional growth. I aim to create impactful, well-engineered solutions that not only meet functional requirements but also deliver meaningful and intuitive user experiences.
          </p>
        </div>
      </div>
    </div>
  )
}
