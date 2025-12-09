"use client"

import { useEffect, useRef, useState } from "react"
import type { Subject } from "@/lib/education-context"

interface SubjectAdaptiveBackgroundProps {
  subject: Subject
  className?: string
}

const SUBJECT_PATTERNS = {
  chinese: {
    type: "poetry-texture",
    colors: ["#8B5CF6", "#A78BFA", "#C4B5FD"],
    chars: ["诗", "词", "赋", "文", "雅", "韵", "墨", "卷"],
  },
  math: {
    type: "formula-trace",
    colors: ["#3B82F6", "#60A5FA", "#93C5FD"],
    formulas: ["∫", "∑", "π", "∞", "√", "≈", "±", "∂"],
  },
  "math-competition": {
    type: "spark-energy",
    colors: ["#F59E0B", "#FBBF24", "#FCD34D"],
    symbols: ["★", "◆", "●", "▲", "■", "◇", "○", "△"],
  },
  english: {
    type: "letter-flow",
    colors: ["#10B981", "#34D399", "#6EE7B7"],
    letters: ["A", "B", "C", "D", "E", "F", "G", "H"],
  },
  science: {
    type: "molecule-network",
    colors: ["#06B6D4", "#22D3EE", "#67E8F9"],
    symbols: ["⚛", "⚗", "🔬", "🧪", "⚡", "🌡", "🔭", "🧬"],
  },
  arts: {
    type: "color-splash",
    colors: ["#EC4899", "#F472B6", "#F9A8D4"],
    shapes: ["◐", "◑", "◒", "◓", "◔", "◕", "◖", "◗"],
  },
  general: {
    type: "geometric-lines",
    colors: ["#6366F1", "#818CF8", "#A5B4FC"],
    symbols: ["◆", "○", "△", "□"],
  },
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  char: string
  size: number
  opacity: number
  color: string
}

export function SubjectAdaptiveBackground({ subject, className = "" }: SubjectAdaptiveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number>()
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const pattern = SUBJECT_PATTERNS[subject]
    particlesRef.current = []

    const particleCount = Math.floor((canvas.width * canvas.height) / 20000)

    for (let i = 0; i < particleCount; i++) {
      const chars =
        (pattern as any).chars ||
        (pattern as any).formulas ||
        (pattern as any).symbols ||
        (pattern as any).letters ||
        (pattern as any).shapes

      particlesRef.current.push({
        id: i,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        char: chars[Math.floor(Math.random() * chars.length)],
        size: Math.random() * 20 + 15,
        opacity: Math.random() * 0.3 + 0.1,
        color: pattern.colors[Math.floor(Math.random() * pattern.colors.length)],
      })
    }

    setIsAnimating(true)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        ctx.save()
        ctx.globalAlpha = particle.opacity
        ctx.fillStyle = particle.color
        ctx.font = `${particle.size}px Arial`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(particle.char, particle.x, particle.y)
        ctx.restore()
      })

      if (pattern.type === "formula-trace" || pattern.type === "molecule-network") {
        particlesRef.current.forEach((p1, i) => {
          particlesRef.current.slice(i + 1).forEach((p2) => {
            const dx = p2.x - p1.x
            const dy = p2.y - p1.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 150) {
              ctx.save()
              ctx.globalAlpha = (1 - distance / 150) * 0.2
              ctx.strokeStyle = p1.color
              ctx.lineWidth = 1
              ctx.beginPath()
              ctx.moveTo(p1.x, p1.y)
              ctx.lineTo(p2.x, p2.y)
              ctx.stroke()
              ctx.restore()
            }
          })
        })
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      setIsAnimating(false)
    }
  }, [subject])

  return <canvas ref={canvasRef} className={`fixed inset-0 pointer-events-none opacity-30 ${className}`} />
}
