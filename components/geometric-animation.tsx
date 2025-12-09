"use client"

import { useEffect, useRef } from "react"

interface GeometricAnimationProps {
  color?: string
  speed?: number
  className?: string
}

interface Line {
  x1: number
  y1: number
  x2: number
  y2: number
  targetX2: number
  targetY2: number
  opacity: number
  speed: number
}

export function GeometricAnimation({ color = "#06b6d4", speed = 1, className = "" }: GeometricAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const linesRef = useRef<Line[]>([])
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 设置画布尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // 初始化线条
    const initLines = () => {
      const lineCount = Math.floor(window.innerWidth / 200)
      linesRef.current = []

      for (let i = 0; i < lineCount; i++) {
        linesRef.current.push({
          x1: Math.random() * canvas.width,
          y1: Math.random() * canvas.height,
          x2: Math.random() * canvas.width,
          y2: Math.random() * canvas.height,
          targetX2: Math.random() * canvas.width,
          targetY2: Math.random() * canvas.height,
          opacity: Math.random() * 0.5 + 0.2,
          speed: (Math.random() * 0.5 + 0.5) * speed,
        })
      }
    }
    initLines()

    // 生成新目标点
    const generateNewTarget = (line: Line) => {
      line.targetX2 = Math.random() * canvas.width
      line.targetY2 = Math.random() * canvas.height
    }

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      linesRef.current.forEach((line) => {
        // 移动线条终点向目标点
        const dx = line.targetX2 - line.x2
        const dy = line.targetY2 - line.y2
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 5) {
          // 到达目标，生成新目标
          generateNewTarget(line)
        } else {
          // 继续移动
          line.x2 += (dx / distance) * line.speed
          line.y2 += (dy / distance) * line.speed
        }

        // 绘制线条
        const gradient = ctx.createLinearGradient(line.x1, line.y1, line.x2, line.y2)
        gradient.addColorStop(0, `${color}00`)
        gradient.addColorStop(
          0.5,
          `${color}${Math.floor(line.opacity * 255)
            .toString(16)
            .padStart(2, "0")}`,
        )
        gradient.addColorStop(1, `${color}00`)

        ctx.strokeStyle = gradient
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(line.x1, line.y1)
        ctx.lineTo(line.x2, line.y2)
        ctx.stroke()

        // 绘制端点光晕
        const glowGradient = ctx.createRadialGradient(line.x2, line.y2, 0, line.x2, line.y2, 8)
        glowGradient.addColorStop(
          0,
          `${color}${Math.floor(line.opacity * 0.8 * 255)
            .toString(16)
            .padStart(2, "0")}`,
        )
        glowGradient.addColorStop(1, `${color}00`)

        ctx.fillStyle = glowGradient
        ctx.beginPath()
        ctx.arc(line.x2, line.y2, 8, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [color, speed])

  return <canvas ref={canvasRef} className={`fixed inset-0 pointer-events-none ${className}`} />
}
