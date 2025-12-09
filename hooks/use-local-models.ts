"use client"

import { useState, useEffect, useCallback } from "react"
import {
  defaultLocalModels,
  checkModelAvailability,
  sendMessageToLocalModel,
  type LocalModel,
} from "@/lib/local-models"

interface ModelStatus {
  totalModels: number
  availableModels: number
  lastChecked: Date | null
}

export function useLocalModels() {
  const [localModels, setLocalModels] = useState<LocalModel[]>(defaultLocalModels)
  const [isLoading, setIsLoading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)

  // 扫描本地模型可用性
  const scanLocalModels = useCallback(async () => {
    setIsScanning(true)
    setIsLoading(true)

    try {
      const updatedModels = await Promise.all(
        localModels.map(async (model) => {
          const isAvailable = await checkModelAvailability(model)
          return { ...model, isAvailable }
        }),
      )

      setLocalModels(updatedModels)
    } catch (error) {
      console.error("扫描本地模型失败:", error)
    } finally {
      setIsScanning(false)
      setIsLoading(false)
    }
  }, [localModels])

  // 发送消息到本地模型
  const sendMessage = useCallback(
    async (model: LocalModel, messages: Array<{ role: string; content: string }>): Promise<string> => {
      if (!model.isAvailable) {
        throw new Error(`模型 ${model.name} 当前不可用`)
      }

      return await sendMessageToLocalModel(model, messages)
    },
    [],
  )

  // 获取模型状态统计
  const getModelStatus = useCallback((): ModelStatus => {
    const totalModels = localModels.length
    const availableModels = localModels.filter((m) => m.isAvailable).length

    return {
      totalModels,
      availableModels,
      lastChecked: new Date(),
    }
  }, [localModels])

  // 初始化时扫描一次
  useEffect(() => {
    scanLocalModels()
  }, [])

  return {
    localModels,
    isLoading,
    isScanning,
    scanLocalModels,
    sendMessage,
    getModelStatus,
  }
}
