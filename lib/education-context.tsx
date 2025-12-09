"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { VoiceSettings } from "./voice-settings"
import type { LocalModel } from "./local-models"
import type { WeatherData } from "./greeting-generator"

export type Subject = "chinese" | "math" | "math-competition" | "english" | "science" | "arts" | "general"

export interface EducationState {
  currentSubject: Subject
  selectedModel: LocalModel | null
  voiceSettings: VoiceSettings
  theme: "dark" | "light" | "eye-care"
  weatherData: WeatherData | null
  studentProfile: {
    name?: string
    grade?: string
    preferredSubjects: Subject[]
  }
}

export interface EducationContextType {
  state: EducationState
  updateSubject: (subject: Subject) => void
  updateModel: (model: LocalModel | null) => void
  updateVoiceSettings: (settings: Partial<VoiceSettings>) => void
  updateTheme: (theme: "dark" | "light" | "eye-care") => void
  updateWeather: (weather: WeatherData | null) => void
  updateStudentProfile: (profile: Partial<EducationState["studentProfile"]>) => void
}

const EducationContext = createContext<EducationContextType | undefined>(undefined)

const SUBJECT_COLORS: Record<Subject, string> = {
  chinese: "#8B5CF6",
  math: "#3B82F6",
  "math-competition": "#F59E0B",
  english: "#10B981",
  science: "#06B6D4",
  arts: "#EC4899",
  general: "#6366F1",
}

const SUBJECT_VOICE_PROFILES: Record<Subject, Partial<VoiceSettings>> = {
  chinese: { voiceType: "female", tone: "calm", speed: "normal" },
  math: { voiceType: "female", tone: "composed", speed: "normal" },
  "math-competition": { voiceType: "child", tone: "lively", speed: "fast" },
  english: { voiceType: "female", tone: "lively", speed: "normal" },
  science: { voiceType: "male", tone: "composed", speed: "normal" },
  arts: { voiceType: "female", tone: "lively", speed: "normal" },
  general: { voiceType: "female", tone: "calm", speed: "normal" },
}

export function EducationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EducationState>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("educationState")
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error("解析教育状态失败:", e)
        }
      }
    }
    return {
      currentSubject: "general" as Subject,
      selectedModel: null,
      voiceSettings: {
        voiceType: "female" as const,
        speed: "normal" as const,
        tone: "calm" as const,
        enabled: true,
        syncWithText: true,
        autoAdjustBySubject: true,
      },
      theme: "dark" as const,
      weatherData: null,
      studentProfile: {
        preferredSubjects: [],
      },
    }
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("educationState", JSON.stringify(state))
    }
  }, [state])

  useEffect(() => {
    if (state.voiceSettings.autoAdjustBySubject && state.currentSubject) {
      const profile = SUBJECT_VOICE_PROFILES[state.currentSubject]
      if (profile) {
        setState((prev) => ({
          ...prev,
          voiceSettings: {
            ...prev.voiceSettings,
            ...profile,
          },
        }))
      }
    }
  }, [state.currentSubject, state.voiceSettings.autoAdjustBySubject])

  const updateSubject = (subject: Subject) => {
    setState((prev) => ({ ...prev, currentSubject: subject }))

    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--subject-color", SUBJECT_COLORS[subject])
    }
  }

  const updateModel = (model: LocalModel | null) => {
    setState((prev) => ({ ...prev, selectedModel: model }))
  }

  const updateVoiceSettings = (settings: Partial<VoiceSettings>) => {
    setState((prev) => ({
      ...prev,
      voiceSettings: { ...prev.voiceSettings, ...settings },
    }))
  }

  const updateTheme = (theme: "dark" | "light" | "eye-care") => {
    setState((prev) => ({ ...prev, theme }))
  }

  const updateWeather = (weather: WeatherData | null) => {
    setState((prev) => ({ ...prev, weatherData: weather }))
  }

  const updateStudentProfile = (profile: Partial<EducationState["studentProfile"]>) => {
    setState((prev) => ({
      ...prev,
      studentProfile: { ...prev.studentProfile, ...profile },
    }))
  }

  return (
    <EducationContext.Provider
      value={{
        state,
        updateSubject,
        updateModel,
        updateVoiceSettings,
        updateTheme,
        updateWeather,
        updateStudentProfile,
      }}
    >
      {children}
    </EducationContext.Provider>
  )
}

export function useEducation() {
  const context = useContext(EducationContext)
  if (context === undefined) {
    throw new Error("useEducation must be used within an EducationProvider")
  }
  return context
}

export function getSubjectColor(subject: Subject): string {
  return SUBJECT_COLORS[subject]
}

export function getSubjectVoiceProfile(subject: Subject): Partial<VoiceSettings> {
  return SUBJECT_VOICE_PROFILES[subject]
}
