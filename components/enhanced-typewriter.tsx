"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface EnhancedTypewriterProps {
  text: string
  speed?: number
  onComplete?: () => void
  className?: string
  enableParticles?: boolean
  highlightKeywords?: string[]
}

export function EnhancedTypewriter({
  text,
  speed = 50,
  onComplete,
  className = "",
  enableParticles = true,
  highlightKeywords = [],
}: EnhancedTypewriterProps) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)

        // 在特殊字符（！？。）时生成粒子效果
        if (enableParticles && ["！", "？", "。", "~", "✨", "🎉"].some((char) => text[currentIndex]?.includes(char))) {
          const newParticle = {
            id: Date.now(),
            x: Math.random() * 100,
            y: Math.random() * 100,
          }
          setParticles((prev) => [...prev, newParticle])

          // 3秒后移除粒子
          setTimeout(() => {
            setParticles((prev) => prev.filter((p) => p.id !== newParticle.id))
          }, 3000)
        }
      }, speed)

      return () => clearTimeout(timer)
    } else {
      onComplete?.()
    }
  }, [currentIndex, text, speed, onComplete, enableParticles])

  // 重置效果当文本改变时
  useEffect(() => {
    setDisplayText("")
    setCurrentIndex(0)
    setParticles([])
  }, [text])

  // 高亮关键词
  const renderTextWithHighlights = (textToRender: string) => {
    if (highlightKeywords.length === 0) {
      return textToRender
    }

    let result = textToRender
    highlightKeywords.forEach((keyword) => {
      const regex = new RegExp(`(${keyword})`, "g")
      result = result.replace(
        regex,
        '<span class="text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text font-semibold">$1</span>',
      )
    })

    return result
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 主文本 */}
      <div
        className="whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: renderTextWithHighlights(displayText) }}
      />

      {/* 光标 */}
      {currentIndex < text.length && (
        <motion.span
          className="inline-block w-0.5 h-5 bg-cyan-400 ml-1"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
        />
      )}

      {/* 粒子效果 */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute pointer-events-none"
          initial={{
            x: particle.x,
            y: particle.y,
            scale: 0,
            opacity: 1,
          }}
          animate={{
            y: particle.y - 100,
            scale: [0, 1, 0],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 3,
            ease: "easeOut",
          }}
        >
          <span className="text-2xl">✨</span>
        </motion.div>
      ))}
    </div>
  )
}
