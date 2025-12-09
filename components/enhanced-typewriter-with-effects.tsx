"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Subject } from "@/lib/education-context"
import { ds } from "@/lib/data" // Assuming ds is imported from some data source

interface EnhancedTypewriterProps {
  text: string
  subject: Subject
  speed?: number
  onComplete?: () => void
  onSegmentComplete?: (segmentIndex: number) => void
  className?: string
  highlightColor?: string
  currentSegmentIndex?: number
}

interface Particle {
  id: number
  x: number
  y: number
  char: string
  color: string
}

const SUBJECT_KEYWORDS: Record<Subject, string[]> = {
  chinese: ["古诗", "诗词", "文学", "作文", "阅读", "文言文", "修辞", "成语", "典故", "韵律"],
  math: ["方程", "几何", "代数", "计算", "公式", "定理", "证明", "函数", "图形", "运算"],
  "math-competition": ["竞赛", "奥数", "思维", "技巧", "难题", "解题", "突破", "创新", "逻辑", "推理"],
  english: ["grammar", "vocabulary", "reading", "writing", "speaking", "listening", "英语", "语法", "词汇"],
  science: ["实验", "原理", "现象", "探究", "科学", "物理", "化学", "生物", "观察", "假设"],
  arts: ["艺术", "创作", "绘画", "音乐", "设计", "美感", "表达", "色彩", "节奏", "情感"],
  general: ["学习", "知识", "思考", "理解", "探索", "发现", "成长", "进步", "努力", "坚持"],
}

const SUBJECT_COLORS: Record<Subject, string> = {
  chinese: "#8B5CF6",
  math: "#3B82F6",
  "math-competition": "#F59E0B",
  english: "#10B981",
  science: "#06B6D4",
  arts: "#EC4899",
  general: "#6366F1",
}

export function EnhancedTypewriterWithEffects({
  text,
  subject,
  speed = 30,
  onComplete,
  onSegmentComplete,
  className = "",
  highlightColor,
  currentSegmentIndex = -1,
}: EnhancedTypewriterProps) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [particles, setParticles] = useState<Particle[]>([])
  const [segments, setSegments] = useState<string[]>([])
  const [completedSegments, setCompletedSegments] = useState<number[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const color = highlightColor || SUBJECT_COLORS[subject]
  const keywords = SUBJECT_KEYWORDS[subject]

  useEffect(() => {
    const textSegments = text.split(/([。！？.!?;；]+)/).filter((s) => s.trim().length > 0)
    const mergedSegments: string[] = []

    for (let i = 0; i < textSegments.length; i++) {
      if (textSegments[i].match(/^[。！？.!?;；]+$/)) {
        if (mergedSegments.length > 0) {
          mergedSegments[mergedSegments.length - 1] += textSegments[i]
        }
      } else {
        mergedSegments.push(textSegments[i])
      }
    }

    setSegments(mergedSegments)
  }, [text])

  useEffect(() => {
    setDisplayText("")
    setCurrentIndex(0)
    setParticles([])
    setCompletedSegments([])
  }, [text])

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        const char = text[currentIndex]
        setDisplayText((prev) => prev + char)
        setCurrentIndex((prev) => prev + 1)

        if (["！", "？", "。", "~", "✨", "🎉", "*"].some((special) => char.includes(special))) {
          createParticle(char)
        }

        let charCount = 0
        for (let i = 0; i < segments.length; i++) {
          charCount += segments[i].length
          if (currentIndex + 1 === charCount && !completedSegments.includes(i)) {
            setCompletedSegments((prev) => [...prev, i])
            onSegmentComplete?.(i)
            break
          }
        }
      }, speed)

      return () => clearTimeout(timer)
    } else if (currentIndex === text.length && onComplete) {
      onComplete()
    }
  }, [currentIndex, text, speed, onComplete, onSegmentComplete, segments, completedSegments])

  const createParticle = (char: string) => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const newParticle: Particle = {
      id: Date.now() + Math.random(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      char: ["✨", "💫", "⭐", "🌟"][Math.floor(Math.random() * 4)],
      color,
    }

    setParticles((prev) => [...prev, newParticle])

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id))
    }, 2000)
  }

  const highlightKeywords = (textToRender: string): JSX.Element[] => {
    const parts: JSX.Element[] = []
    let lastIndex = 0

    ds.forEach((keyword) => {
      const regex = new RegExp(`(${keyword})`, "g")
      let match

      while ((match = regex.exec(textToRender)) !== null) {
        if (match.index > lastIndex) {
          parts.push(<span key={`text-${lastIndex}`}>{textToRender.slice(lastIndex, match.index)}</span>)
        }

        parts.push(
          <motion.span
            key={`keyword-${match.index}`}
            className="font-semibold"
            style={{
              background: `linear-gradient(135deg, ${color}dd, ${color}88)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5 }}
          >
            {match[1]}
          </motion.span>,
        )

        lastIndex = match.index + match[1].length
      }
    })

    if (lastIndex < textToRender.length) {
      parts.push(<span key={`text-end-${lastIndex}`}>{textToRender.slice(lastIndex)}</span>)
    }

    return parts.length > 0 ? parts : [<span key="full-text">{textToRender}</span>]
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="whitespace-pre-wrap leading-relaxed">{highlightKeywords(displayText)}</div>

      {currentIndex < text.length && (
        <motion.span
          className="inline-block w-0.5 h-5 ml-1"
          style={{ backgroundColor: color }}
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
        />
      )}

      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute pointer-events-none text-2xl"
            style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
            initial={{ scale: 0, opacity: 1, y: 0 }}
            animate={{ scale: [0, 1.5, 0], opacity: [1, 1, 0], y: -80 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
          >
            {particle.char}
          </motion.div>
        ))}
      </AnimatePresence>

      {currentSegmentIndex >= 0 && (
        <motion.div
          className="absolute left-0 right-0 h-0.5 bottom-0"
          style={{ backgroundColor: `${color}40` }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: currentSegmentIndex / segments.length }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  )
}
