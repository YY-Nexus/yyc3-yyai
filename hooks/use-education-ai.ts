"use client"

import { useState, useCallback } from "react"
import { subjects, type LearningProgress } from "@/config/education-system"

interface QuestionResponse {
  answer: string
  explanation?: string
  relatedTopics?: string[]
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedTime: number
}

interface LearningAnalysis {
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  nextSteps: string[]
  overallScore: number
}

export function useEducationAI() {
  const [learningProgress, setLearningProgress] = useState<LearningProgress[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // 智能问答
  const askQuestion = useCallback(
    async (question: string, subjectId: string, context?: string): Promise<QuestionResponse> => {
      // 模拟AI响应
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const subject = subjects.find((s) => s.id === subjectId)

      return {
        answer: `针对您在${subject?.name || "该学科"}中的问题："${question}"，这里是详细解答...`,
        explanation: "这个问题涉及到基础概念的理解和应用...",
        relatedTopics: subject?.topics.slice(0, 2).map((t) => t.name) || [],
        difficulty: "intermediate",
        estimatedTime: 15,
      }
    },
    [],
  )

  // 学习进度分析
  const analyzeLearningProgress = useCallback(
    async (subjectId: string): Promise<LearningAnalysis> => {
      setIsAnalyzing(true)

      try {
        // 模拟分析过程
        await new Promise((resolve) => setTimeout(resolve, 2000))

        const subjectProgress = learningProgress.filter((p) => p.subjectId === subjectId)
        const averageScore = subjectProgress.reduce((sum, p) => sum + (p.score || 0), 0) / subjectProgress.length || 0

        return {
          strengths: ["基础概念掌握良好", "学习态度积极"],
          weaknesses: ["解题速度需要提升", "复杂问题分析能力待加强"],
          recommendations: ["多做练习题巩固基础", "参加专项训练提升技能"],
          nextSteps: ["完成当前章节练习", "准备下一阶段学习内容"],
          overallScore: Math.round(averageScore),
        }
      } finally {
        setIsAnalyzing(false)
      }
    },
    [learningProgress],
  )

  // 更新学习进度
  const updateProgress = useCallback((progress: LearningProgress) => {
    setLearningProgress((prev) => {
      const existing = prev.find((p) => p.subjectId === progress.subjectId && p.topicId === progress.topicId)

      if (existing) {
        return prev.map((p) =>
          p.subjectId === progress.subjectId && p.topicId === progress.topicId
            ? { ...p, ...progress, lastStudied: new Date() }
            : p,
        )
      } else {
        return [...prev, { ...progress, lastStudied: new Date() }]
      }
    })
  }, [])

  // 获取推荐学习内容
  const getRecommendations = useCallback(
    (subjectId: string) => {
      const subject = subjects.find((s) => s.id === subjectId)
      if (!subject) return []

      const userProgress = learningProgress.filter((p) => p.subjectId === subjectId)
      const completedTopics = userProgress.filter((p) => p.progress >= 80).map((p) => p.topicId)

      // 推荐未完成或需要复习的主题
      return subject.topics.filter((topic) => !completedTopics.includes(topic.id))
    },
    [learningProgress],
  )

  return {
    subjects,
    learningProgress,
    isAnalyzing,
    askQuestion,
    analyzeLearningProgress,
    updateProgress,
    getRecommendations,
  }
}
