"use client"

import { useState, useEffect } from "react"

interface TypewriterEffectProps {
  text: string
  speed?: number
  onComplete?: () => void
  className?: string
}

export function TypewriterEffect({ text, speed = 50, onComplete, className = "" }: TypewriterEffectProps) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, speed)

      return () => clearTimeout(timer)
    } else if (!isComplete) {
      setIsComplete(true)
      onComplete?.()
    }
  }, [currentIndex, text, speed, onComplete, isComplete])

  // 重置效果当文本改变时
  useEffect(() => {
    setDisplayText("")
    setCurrentIndex(0)
    setIsComplete(false)
  }, [text])

  return (
    <span className={className}>
      {displayText}
      {!isComplete && <span className="animate-pulse">|</span>}
    </span>
  )
}

interface TypewriterLineProps {
  isActive: boolean
  className?: string
}

export function TypewriterLine({ isActive, className = "" }: TypewriterLineProps) {
  return (
    <div className={`relative ${className}`}>
      <div
        className={`h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000 ${
          isActive ? "w-full opacity-100" : "w-0 opacity-0"
        }`}
      />
      <div
        className={`absolute right-0 top-0 w-2 h-0.5 bg-cyan-400 transition-all duration-300 ${
          isActive ? "animate-pulse" : "opacity-0"
        }`}
      />
    </div>
  )
}

interface AnimatedTextBlockProps {
  text: string
  speed?: number
  onComplete?: () => void
  className?: string
  showLine?: boolean
}

export function AnimatedTextBlock({
  text,
  speed = 30,
  onComplete,
  className = "",
  showLine = true,
}: AnimatedTextBlockProps) {
  const [isTyping, setIsTyping] = useState(true)
  const [showLineAnimation, setShowLineAnimation] = useState(false)

  const handleTypewriterComplete = () => {
    setIsTyping(false)
    if (showLine) {
      setTimeout(() => {
        setShowLineAnimation(true)
      }, 200)
    }
    onComplete?.()
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <TypewriterEffect text={text} speed={speed} onComplete={handleTypewriterComplete} className="block" />
      {showLine && <TypewriterLine isActive={showLineAnimation} className="mt-2" />}
    </div>
  )
}
