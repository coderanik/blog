"use client"

import { useEffect, useState } from "react"
import { motion, useScroll, useSpring } from "framer-motion"

export function ReadingProgress() {
  const [isVisible, setIsVisible] = useState(false)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      // Show when scrolling starts (after 5%) and hide when reading is complete (above 95%)
      setIsVisible(latest > 0.05 && latest < 0.95)
    })
    return () => unsubscribe()
  }, [scrollYProgress])

  if (!isVisible) return null

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 h-1 bg-primary/20 origin-left z-50" 
      style={{ scaleX }}
    >
      <div className="h-full w-full bg-gradient-to-r from-primary to-secondary" />
    </motion.div>
  )
}
