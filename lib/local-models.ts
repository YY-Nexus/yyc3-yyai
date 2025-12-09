// 本地模型管理系统 - 支持多学科专属模型配置
export interface LocalModel {
  id: string
  name: string
  provider: "ollama" | "lmstudio" | "text-generation-webui"
  endpoint: string
  status: "online" | "offline" | "unknown"
  capabilities: string[]
  modelSize?: string
  context_length?: number
  subjectSpecialization?: string[] // 学科专长
  voiceProfile?: {
    // 推荐语音配置
    voiceType: "male" | "female" | "child"
    tone: "calm" | "lively" | "composed"
    speed: "slow" | "normal" | "fast"
  }
}

export interface ModelProvider {
  name: string
  defaultEndpoint: string
  checkEndpoint: string
  modelsEndpoint: string
}

// 学科专属模型配置
export const SUBJECT_MODELS = {
  chinese: {
    name: "语文模型",
    keywords: ["古诗", "作文", "阅读", "文言文", "修辞"],
    voiceProfile: { voiceType: "female" as const, tone: "calm" as const, speed: "normal" as const },
    animationColor: "#8B5CF6", // 紫色 - 诗意
  },
  math: {
    name: "数学模型",
    keywords: ["方程", "几何", "代数", "计算", "证明"],
    voiceProfile: { voiceType: "female" as const, tone: "composed" as const, speed: "normal" as const },
    animationColor: "#3B82F6", // 蓝色 - 逻辑
  },
  "math-competition": {
    name: "奥数模型",
    keywords: ["竞赛", "奥数", "难题", "思维", "技巧"],
    voiceProfile: { voiceType: "child" as const, tone: "lively" as const, speed: "fast" as const },
    animationColor: "#F59E0B", // 橙色 - 活力
  },
  english: {
    name: "英语模型",
    keywords: ["grammar", "vocabulary", "reading", "writing", "speaking"],
    voiceProfile: { voiceType: "female" as const, tone: "lively" as const, speed: "normal" as const },
    animationColor: "#10B981", // 绿色 - 国际化
  },
  science: {
    name: "科学模型",
    keywords: ["实验", "原理", "现象", "探究", "科技"],
    voiceProfile: { voiceType: "male" as const, tone: "composed" as const, speed: "normal" as const },
    animationColor: "#06B6D4", // 青色 - 科技感
  },
}

// 模型提供商配置
export const MODEL_PROVIDERS: Record<string, ModelProvider> = {
  ollama: {
    name: "Ollama",
    defaultEndpoint: "http://localhost:11434",
    checkEndpoint: "/api/tags",
    modelsEndpoint: "/api/tags",
  },
  lmstudio: {
    name: "LM Studio",
    defaultEndpoint: "http://localhost:1234",
    checkEndpoint: "/v1/models",
    modelsEndpoint: "/v1/models",
  },
  "text-generation-webui": {
    name: "Text Generation WebUI",
    defaultEndpoint: "http://localhost:5000",
    checkEndpoint: "/api/v1/model",
    modelsEndpoint: "/api/v1/model",
  },
}

// 检查模型可用性
export async function checkModelAvailability(
  provider: keyof typeof MODEL_PROVIDERS,
  endpoint?: string,
): Promise<boolean> {
  const providerConfig = MODEL_PROVIDERS[provider]
  const baseUrl = endpoint || providerConfig.defaultEndpoint

  try {
    const response = await fetch(`${baseUrl}${providerConfig.checkEndpoint}`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    })
    return response.ok
  } catch (error) {
    console.error(`检查 ${provider} 可用性失败:`, error)
    return false
  }
}

// 发现本地模型
export async function localModelDiscovery(): Promise<{
  models: LocalModel[]
  availableProviders: string[]
}> {
  const discoveredModels: LocalModel[] = []
  const availableProviders: string[] = []

  for (const [providerId, config] of Object.entries(MODEL_PROVIDERS)) {
    const isAvailable = await checkModelAvailability(providerId as keyof typeof MODEL_PROVIDERS)

    if (isAvailable) {
      availableProviders.push(config.name)

      try {
        const models = await fetchModelsFromProvider(providerId as keyof typeof MODEL_PROVIDERS, config.defaultEndpoint)
        discoveredModels.push(...models)
      } catch (error) {
        console.error(`从 ${config.name} 获取模型列表失败:`, error)
      }
    }
  }

  return { models: discoveredModels, availableProviders }
}

// 从提供商获取模型列表
async function fetchModelsFromProvider(
  provider: keyof typeof MODEL_PROVIDERS,
  endpoint: string,
): Promise<LocalModel[]> {
  const config = MODEL_PROVIDERS[provider]
  const models: LocalModel[] = []

  try {
    const response = await fetch(`${endpoint}${config.modelsEndpoint}`)
    const data = await response.json()

    if (provider === "ollama") {
      const ollamaModels = data.models || []
      models.push(
        ...ollamaModels.map((model: any) => ({
          id: `ollama-${model.name}`,
          name: model.name,
          provider: "ollama" as const,
          endpoint: endpoint,
          status: "online" as const,
          capabilities: ["chat", "completion"],
          modelSize: model.size,
          context_length: model.details?.parameter_size,
          subjectSpecialization: inferSubjectFromModelName(model.name),
          voiceProfile: getDefaultVoiceProfile(inferSubjectFromModelName(model.name)),
        })),
      )
    } else if (provider === "lmstudio") {
      const lmstudioModels = data.data || []
      models.push(
        ...lmstudioModels.map((model: any) => ({
          id: `lmstudio-${model.id}`,
          name: model.id,
          provider: "lmstudio" as const,
          endpoint: endpoint,
          status: "online" as const,
          capabilities: ["chat", "completion"],
          subjectSpecialization: inferSubjectFromModelName(model.id),
          voiceProfile: getDefaultVoiceProfile(inferSubjectFromModelName(model.id)),
        })),
      )
    } else if (provider === "text-generation-webui") {
      models.push({
        id: `tgw-${data.result}`,
        name: data.result,
        provider: "text-generation-webui" as const,
        endpoint: endpoint,
        status: "online" as const,
        capabilities: ["chat", "completion"],
        subjectSpecialization: inferSubjectFromModelName(data.result),
        voiceProfile: getDefaultVoiceProfile(inferSubjectFromModelName(data.result)),
      })
    }
  } catch (error) {
    console.error(`获取 ${provider} 模型列表失败:`, error)
  }

  return models
}

// 从模型名称推断学科专长
function inferSubjectFromModelName(modelName: string): string[] {
  const name = modelName.toLowerCase()
  const subjects: string[] = []

  if (name.includes("chinese") || name.includes("语文") || name.includes("qwen")) {
    subjects.push("chinese")
  }
  if (name.includes("math") || name.includes("数学")) {
    subjects.push("math", "math-competition")
  }
  if (name.includes("code") || name.includes("代码")) {
    subjects.push("science")
  }
  if (name.includes("english") || name.includes("英语")) {
    subjects.push("english")
  }

  return subjects.length > 0 ? subjects : ["general"]
}

// 获取学科默认语音配置
function getDefaultVoiceProfile(subjects: string[]): LocalModel["voiceProfile"] {
  if (subjects.includes("chinese")) {
    return SUBJECT_MODELS.chinese.voiceProfile
  } else if (subjects.includes("math-competition")) {
    return SUBJECT_MODELS["math-competition"].voiceProfile
  } else if (subjects.includes("math")) {
    return SUBJECT_MODELS.math.voiceProfile
  } else if (subjects.includes("english")) {
    return SUBJECT_MODELS.english.voiceProfile
  } else if (subjects.includes("science")) {
    return SUBJECT_MODELS.science.voiceProfile
  }

  return { voiceType: "female", tone: "calm", speed: "normal" }
}

// 发送消息到本地模型
export async function sendMessageToLocalModel(
  model: LocalModel,
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  const { provider, endpoint } = model

  try {
    if (provider === "ollama") {
      return await sendToOllama(endpoint, model.name, messages)
    } else if (provider === "lmstudio") {
      return await sendToLMStudio(endpoint, model.name, messages)
    } else if (provider === "text-generation-webui") {
      return await sendToTextGenerationWebUI(endpoint, messages)
    }
  } catch (error) {
    throw new Error(`本地模型调用失败: ${error instanceof Error ? error.message : "未知错误"}`)
  }

  return ""
}

// Ollama API调用
async function sendToOllama(
  endpoint: string,
  modelName: string,
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  const response = await fetch(`${endpoint}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: modelName,
      messages: messages,
      stream: false,
    }),
  })

  const data = await response.json()
  return data.message?.content || ""
}

// LM Studio API调用
async function sendToLMStudio(
  endpoint: string,
  modelName: string,
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  const response = await fetch(`${endpoint}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: modelName,
      messages: messages,
      temperature: 0.7,
    }),
  })

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ""
}

// Text Generation WebUI API调用
async function sendToTextGenerationWebUI(
  endpoint: string,
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  const prompt = messages.map((m) => `${m.role}: ${m.content}`).join("\n")

  const response = await fetch(`${endpoint}/api/v1/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: prompt,
      max_new_tokens: 500,
    }),
  })

  const data = await response.json()
  return data.results?.[0]?.text || ""
}

export const defaultLocalModels: LocalModel[] = []
