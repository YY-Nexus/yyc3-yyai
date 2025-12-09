"use client"

// 智能提示词Hook

import { useState } from "react"
import { systemArchitecture, UserRole, type FunctionModule } from "../config/system-architecture"
import { PROMPT_TEMPLATES } from "../config/prompt-templates"

interface SmartSuggestion {
  title: string
  description: string
  icon: string
  action: string
}

export function useSmartPrompt(userRole: UserRole = UserRole.GENERAL) {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([])
  const [matchedModule, setMatchedModule] = useState<FunctionModule | null>(null)

  // 智能分析用户输入
  const analyzeInput = (userInput: string) => {
    // 匹配最佳功能模块
    const module = systemArchitecture.matchModule(userInput, userRole)
    setMatchedModule(module)

    // 获取智能建议
    const smartSuggestions = systemArchitecture.getSuggestions(userInput, userRole)
    setSuggestions(smartSuggestions)

    return {
      module,
      suggestions: smartSuggestions,
      prompt: generateSmartPrompt(userInput, module),
    }
  }

  // 生成智能提示词
  const generateSmartPrompt = (userInput: string, module: FunctionModule | null): string => {
    if (!module) {
      return PROMPT_TEMPLATES.SYSTEM.WELCOME
    }

    // 根据模块类型返回对应提示词
    const modulePrompt = module.prompts.find((p) =>
      p.keywords?.some((keyword) => userInput.toLowerCase().includes(keyword.toLowerCase())),
    )

    return modulePrompt?.template || module.description
  }

  // 获取功能帮助
  const getFunctionHelp = (functionId: string): string => {
    const module = systemArchitecture.modules.find((m) => m.id === functionId)
    return module?.prompts.find((p) => p.id.includes("help"))?.template || PROMPT_TEMPLATES.SYSTEM.WELCOME
  }

  return {
    analyzeInput,
    generateSmartPrompt,
    getFunctionHelp,
    suggestions,
    matchedModule,
  }
}
