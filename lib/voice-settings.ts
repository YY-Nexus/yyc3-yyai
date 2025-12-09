// 高级语音设置系统 - 支持自定义语音上传与学科智能匹配
export interface VoiceSettings {
  voiceType: "male" | "female" | "child" | "custom"
  speed: "slow" | "normal" | "fast"
  tone: "calm" | "lively" | "composed"
  customVoiceUrl?: string
  customVoiceName?: string
  enabled: boolean
  syncWithText: boolean // 语音与文本严格同步
  autoAdjustBySubject: boolean // 根据学科自动调整
}

export interface VoiceControl {
  isPlaying: boolean
  isPaused: boolean
  currentTime: number
  duration: number
  currentTextIndex: number // 当前播放到的文本索引
}

export interface CustomVoiceData {
  id: string
  name: string
  url: string
  uploadDate: Date
  duration: number
  fileSize: number
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  voiceType: "female",
  speed: "normal",
  tone: "calm",
  enabled: true,
  syncWithText: true,
  autoAdjustBySubject: true,
}

// 速度映射（更精细的控制）
export const SPEED_MAP = {
  slow: 0.7,
  normal: 1.0,
  fast: 1.3,
}

// 音调映射
export const PITCH_MAP = {
  calm: 0.9,
  lively: 1.2,
  composed: 1.0,
}

// 语音类型配置（支持多种中文语音）
export const VOICE_TYPE_CONFIG = {
  male: {
    name: "男声",
    icon: "👨",
    pitch: 0.85,
    fallbackVoices: [
      "Microsoft Yunyang Online (Natural) - Chinese (Mainland)",
      "Microsoft Yunjian Online (Natural) - Chinese (Mainland)",
      "zh-CN-YunyangNeural",
      "zh-CN",
    ],
  },
  female: {
    name: "女声",
    icon: "👩",
    pitch: 1.0,
    fallbackVoices: [
      "Microsoft Xiaoxiao Online (Natural) - Chinese (Mainland)",
      "Microsoft Xiaoyi Online (Natural) - Chinese (Mainland)",
      "zh-CN-XiaoxiaoNeural",
      "zh-CN",
    ],
  },
  child: {
    name: "童声",
    icon: "👶",
    pitch: 1.3,
    fallbackVoices: [
      "Microsoft Yunxi Online (Natural) - Chinese (Mainland)",
      "Microsoft Xiaomo Online (Natural) - Chinese (Mainland)",
      "zh-CN-YunxiNeural",
      "zh-CN",
    ],
  },
  custom: {
    name: "自定义",
    icon: "🎤",
    pitch: 1.0,
    fallbackVoices: [],
  },
}

// 学科智能语音匹配
export const SUBJECT_VOICE_PROFILES = {
  chinese: {
    voiceType: "female" as const,
    tone: "calm" as const,
    speed: "normal" as const,
    description: "语文学习使用平静女声，帮助理解文学之美",
  },
  math: {
    voiceType: "female" as const,
    tone: "composed" as const,
    speed: "normal" as const,
    description: "数学学习使用沉稳女声，培养逻辑思维",
  },
  "math-competition": {
    voiceType: "child" as const,
    tone: "lively" as const,
    speed: "fast" as const,
    description: "奥数竞赛使用活泼童声，激发学习兴趣",
  },
  english: {
    voiceType: "female" as const,
    tone: "lively" as const,
    speed: "normal" as const,
    description: "英语学习使用活泼女声，增强语言感知",
  },
  science: {
    voiceType: "male" as const,
    tone: "composed" as const,
    speed: "normal" as const,
    description: "科学探索使用沉稳男声，传递科学严谨",
  },
}

// 创建语音合成实例（支持Web Speech API）
export function createSpeechSynthesis(text: string, settings: VoiceSettings): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text)

  utterance.lang = "zh-CN"
  utterance.rate = SPEED_MAP[settings.speed]
  utterance.pitch = PITCH_MAP[settings.tone] * (VOICE_TYPE_CONFIG[settings.voiceType]?.pitch || 1.0)
  utterance.volume = 1.0

  // 尝试设置特定语音
  const voices = speechSynthesis.getVoices()
  const voiceConfig = VOICE_TYPE_CONFIG[settings.voiceType]

  if (voiceConfig && voiceConfig.fallbackVoices.length > 0) {
    for (const voiceName of voiceConfig.fallbackVoices) {
      const targetVoice = voices.find((voice) => voice.name.includes(voiceName) || voice.lang.includes(voiceName))
      if (targetVoice) {
        utterance.voice = targetVoice
        break
      }
    }
  }

  return utterance
}

// 创建自定义语音播放器（使用Web Audio API）
export class CustomVoicePlayer {
  private audioContext: AudioContext | null = null
  private sourceNode: AudioBufferSourceNode | null = null
  private audioBuffer: AudioBuffer | null = null
  private startTime = 0
  private pauseTime = 0
  private isPlaying = false
  private isPaused = false

  constructor() {
    if (typeof window !== "undefined") {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  async loadAudio(url: string): Promise<void> {
    if (!this.audioContext) throw new Error("AudioContext not available")

    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
    } catch (error) {
      console.error("加载音频失败:", error)
      throw error
    }
  }

  play(offset = 0): void {
    if (!this.audioContext || !this.audioBuffer) return

    if (this.isPaused) {
      // 从暂停位置继续播放
      this.resume()
      return
    }

    // 停止当前播放
    this.stop()

    // 创建新的源节点
    this.sourceNode = this.audioContext.createBufferSource()
    this.sourceNode.buffer = this.audioBuffer
    this.sourceNode.connect(this.audioContext.destination)

    // 记录开始时间
    this.startTime = this.audioContext.currentTime - offset
    this.sourceNode.start(0, offset)

    this.isPlaying = true
    this.isPaused = false
  }

  pause(): void {
    if (!this.audioContext || !this.isPlaying || this.isPaused) return

    this.pauseTime = this.audioContext.currentTime - this.startTime
    this.stop()
    this.isPaused = true
    this.isPlaying = false
  }

  resume(): void {
    if (!this.isPaused) return

    this.play(this.pauseTime)
    this.isPaused = false
  }

  stop(): void {
    if (this.sourceNode) {
      try {
        this.sourceNode.stop()
      } catch (e) {
        // 已经停止的节点会抛出错误，忽略
      }
      this.sourceNode.disconnect()
      this.sourceNode = null
    }
    this.isPlaying = false
    this.isPaused = false
    this.pauseTime = 0
  }

  getCurrentTime(): number {
    if (!this.audioContext) return 0

    if (this.isPaused) {
      return this.pauseTime
    }

    if (this.isPlaying) {
      return this.audioContext.currentTime - this.startTime
    }

    return 0
  }

  getDuration(): number {
    return this.audioBuffer?.duration || 0
  }

  seek(time: number): void {
    const wasPlaying = this.isPlaying
    this.stop()
    if (wasPlaying) {
      this.play(time)
    } else {
      this.pauseTime = time
      this.isPaused = true
    }
  }

  getState(): { isPlaying: boolean; isPaused: boolean } {
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
    }
  }

  dispose(): void {
    this.stop()
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    this.audioBuffer = null
  }
}

// 保存语音设置到本地存储
export function saveVoiceSettings(settings: VoiceSettings): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("voiceSettings", JSON.stringify(settings))
  }
}

// 从本地存储加载语音设置
export function loadVoiceSettings(): VoiceSettings {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("voiceSettings")
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error("解析语音设置失败:", e)
      }
    }
  }
  return DEFAULT_VOICE_SETTINGS
}

// 保存自定义语音数据
export function saveCustomVoice(voiceData: CustomVoiceData): void {
  if (typeof window !== "undefined") {
    const voices = loadCustomVoices()
    voices.push(voiceData)
    localStorage.setItem("customVoices", JSON.stringify(voices))
  }
}

// 加载所有自定义语音
export function loadCustomVoices(): CustomVoiceData[] {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("customVoices")
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error("解析自定义语音失败:", e)
      }
    }
  }
  return []
}

// 删除自定义语音
export function deleteCustomVoice(voiceId: string): void {
  if (typeof window !== "undefined") {
    const voices = loadCustomVoices()
    const filtered = voices.filter((v) => v.id !== voiceId)
    localStorage.setItem("customVoices", JSON.stringify(filtered))
  }
}

// 根据学科自动调整语音设置
export function getVoiceSettingsForSubject(subject: string, currentSettings: VoiceSettings): Partial<VoiceSettings> {
  const profile = SUBJECT_VOICE_PROFILES[subject as keyof typeof SUBJECT_VOICE_PROFILES]

  if (!profile || !currentSettings.autoAdjustBySubject) {
    return {}
  }

  return {
    voiceType: profile.voiceType,
    tone: profile.tone,
    speed: profile.speed,
  }
}

// 文本分段用于同步播放
export function segmentTextForSync(text: string): string[] {
  // 按句子分段（支持中英文）
  const segments = text.split(/([。！？.!?;；]+)/).filter((s) => s.trim().length > 0)

  // 合并标点符号与前面的文本
  const result: string[] = []
  for (let i = 0; i < segments.length; i++) {
    if (segments[i].match(/^[。！？.!?;；]+$/)) {
      if (result.length > 0) {
        result[result.length - 1] += segments[i]
      }
    } else {
      result.push(segments[i])
    }
  }

  return result
}
