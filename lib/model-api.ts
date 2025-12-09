// 统一的模型API调用接口

import { localModelDiscovery, type LocalModel } from "./local-models"

export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface ModelResponse {
  content: string
  model: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class ModelAPI {
  // 发送消息到指定模型
  static async sendMessage(
    modelId: string,
    messages: ChatMessage[],
    options?: {
      temperature?: number
      max_tokens?: number
      stream?: boolean
    },
  ): Promise<ModelResponse> {
    // 检查是否为本地模型
    const localModels = localModelDiscovery.getDiscoveredModels()
    const localModel = localModels.find((m) => m.id === modelId)

    if (localModel) {
      return await this.sendToLocalModel(localModel, messages, options)
    } else {
      return await this.sendToCloudModel(modelId, messages, options)
    }
  }

  // 发送到本地模型
  private static async sendToLocalModel(
    model: LocalModel,
    messages: ChatMessage[],
    options?: any,
  ): Promise<ModelResponse> {
    try {
      const content = await localModelDiscovery.sendMessage(model, messages)

      return {
        content,
        model: model.id,
        usage: {
          prompt_tokens: this.estimateTokens(messages.map((m) => m.content).join(" ")),
          completion_tokens: this.estimateTokens(content),
          total_tokens: 0,
        },
      }
    } catch (error) {
      throw new Error(`本地模型 ${model.name} 调用失败: ${error instanceof Error ? error.message : "未知错误"}`)
    }
  }

  // 发送到云端模型（模拟实现）
  private static async sendToCloudModel(
    modelId: string,
    messages: ChatMessage[],
    options?: any,
  ): Promise<ModelResponse> {
    // 这里可以集成真实的云端API
    // 目前返回模拟响应
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    const userMessage = messages[messages.length - 1]?.content || ""
    const response = this.generateMockResponse(userMessage, modelId)

    return {
      content: response,
      model: modelId,
      usage: {
        prompt_tokens: this.estimateTokens(messages.map((m) => m.content).join(" ")),
        completion_tokens: this.estimateTokens(response),
        total_tokens: 0,
      },
    }
  }

  // 生成模拟响应（保持原有逻辑）
  private static generateMockResponse(input: string, modelId: string): string {
    const lowerInput = input.toLowerCase()

    // 根据不同模型返回不同风格的回复
    const modelStyles = {
      "gpt-4": "🧠 **GPT-4 深度分析**\n\n",
      "gpt-3.5": "⚡ **GPT-3.5 快速回复**\n\n",
      "claude-3": "📚 **Claude-3 详细解答**\n\n",
      "gemini-pro": "🔍 **Gemini Pro 多维分析**\n\n",
      "jimeng-ai": "✨ **即梦AI 创意回复**\n\n",
    }

    const prefix = modelStyles[modelId as keyof typeof modelStyles] || "🤖 **AI助手回复**\n\n"

    // 检查言启万象创意功能
    if (["创意", "设计", "文案", "图片", "视频", "生成", "制作"].some((keyword) => lowerInput.includes(keyword))) {
      return `${prefix}🌟 **言启万象 - AI创意平台** 欢迎您！

🎭 **创意工坊全览：**

📝 **文创工坊** - 智能文案创作
• 营销文案、产品描述、故事创作
• 诗歌生成、剧本创作、新闻稿件

🎨 **即梦AI** - 视觉创意生成  
• 图像生成、风格转换、logo设计
• 海报制作、插画创作、概念设计

🎬 **影像创作** - 视频动画制作
• 视频剪辑、动画生成、特效制作
• 配音合成、字幕生成、短视频创作

💫 **使用方式：**
• 直接描述您的创意需求
• 上传参考图片或文档
• 指定风格、色调、情感基调
• 我会为您提供专业的创意方案

准备好释放您的创意了吗？告诉我您的想法！`
    }

    // 系统状态查询
    if (["状态", "系统", "运行"].some((keyword) => lowerInput.includes(keyword))) {
      return `${prefix}🖥️ **NEXUS OS 系统状态报告**

🟢 **核心服务状态：**
• AI 引擎：在线运行 (${modelId})
• 本地模型：${localModelDiscovery.getDiscoveredModels().length} 个已发现
• 创意引擎：高性能模式
• 数据库：连接正常  
• 网络服务：稳定

📊 **模型状态：**
• 当前模型：${modelId}
• 响应延迟：${Math.floor(Math.random() * 200 + 50)}ms
• 可用性：99.9%

系统运行状态良好，所有功能正常可用！`
    }

    // 默认回复
    return `${prefix}我正在使用 **${modelId}** 模型为您服务。

🎯 **我可以帮助您：**
• 创意内容生成 - 文案、图像、视频
• 数据分析处理 - 报表、统计、可视化
• 系统功能操作 - 客户管理、表单创建
• 智能对话交互 - 问答、建议、指导

💡 **使用提示：**
• 详细描述您的需求获得更好的回复
• 尝试说"创意"体验AI内容生成
• 说"系统状态"查看运行情况
• 上传文件进行批量处理

有什么具体需要帮助的吗？`
  }

  // 估算token数量（简单实现）
  private static estimateTokens(text: string): number {
    // 中文按字符计算，英文按单词计算
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length
    const englishWords = text
      .replace(/[\u4e00-\u9fff]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 0).length

    return Math.ceil(chineseChars * 1.5 + englishWords)
  }

  // 获取模型信息
  static async getModelInfo(modelId: string) {
    const localModels = localModelDiscovery.getDiscoveredModels()
    const localModel = localModels.find((m) => m.id === modelId)

    if (localModel) {
      return {
        id: localModel.id,
        name: localModel.name,
        provider: localModel.provider,
        type: "local" as const,
        status: localModel.status,
        capabilities: localModel.capabilities,
        endpoint: localModel.endpoint,
      }
    }

    // 云端模型信息
    const cloudModels = {
      "gpt-4": { name: "GPT-4", provider: "OpenAI", capabilities: ["chat", "reasoning", "code"] },
      "gpt-3.5": { name: "GPT-3.5", provider: "OpenAI", capabilities: ["chat", "completion"] },
      "claude-3": { name: "Claude-3", provider: "Anthropic", capabilities: ["chat", "analysis", "writing"] },
      "gemini-pro": { name: "Gemini Pro", provider: "Google", capabilities: ["chat", "vision", "multimodal"] },
      "jimeng-ai": { name: "即梦AI", provider: "JiMeng", capabilities: ["creative", "image", "design"] },
    }

    const cloudModel = cloudModels[modelId as keyof typeof cloudModels]
    if (cloudModel) {
      return {
        id: modelId,
        name: cloudModel.name,
        provider: cloudModel.provider,
        type: "cloud" as const,
        status: "online" as const,
        capabilities: cloudModel.capabilities,
      }
    }

    return null
  }
}
