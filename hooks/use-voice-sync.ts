"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { CustomVoicePlayer, createSpeechSynthesis, segmentTextForSync } from "@/lib/voice-settings"
import type { VoiceSettings } from "@/lib/voice-settings"

export interface VoiceSyncState {
  isPlaying: boolean
  isPaused: boolean
  currentTime: number
  duration: number
  currentSegmentIndex: number
}

export function useVoiceSync(text: string, settings: VoiceSettings) {
  const [state, setState] = useState<VoiceSyncState>({
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    duration: 0,
    currentSegmentIndex: -1,
  })

  const customPlayerRef = useRef<CustomVoicePlayer | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const segmentsRef = useRef<string[]>([])
  const timeIntervalsRef = useRef<number[]>([])

  useEffect(() => {
    if (settings.syncWithText) {
      segmentsRef.current = segmentTextForSync(text)
    }

    return () => {
      stop()
    }
  }, [text, settings.syncWithText])

  const play = useCallback(async () => {
    if (!settings.enabled) return

    if (settings.voiceType === "custom" && settings.customVoiceUrl) {
      if (!customPlayerRef.current) {
        customPlayerRef.current = new CustomVoicePlayer()
        await customPlayerRef.current.loadAudio(settings.customVoiceUrl)
      }

      customPlayerRef.current.play()

      const duration = customPlayerRef.current.getDuration()
      setState((prev) => ({ ...prev, isPlaying: true, isPaused: false, duration }))

      const updateInterval = setInterval(() => {
        if (customPlayerRef.current) {
          const currentTime = customPlayerRef.current.getCurrentTime()
          const segmentIndex = Math.floor((currentTime / duration) * segmentsRef.current.length)

          setState((prev) => ({
            ...prev,
            currentTime,
            currentSegmentIndex: segmentIndex,
          }))

          if (currentTime >= duration) {
            clearInterval(updateInterval)
            setState((prev) => ({ ...prev, isPlaying: false, currentSegmentIndex: -1 }))
          }
        }
      }, 100)
    } else {
      if (utteranceRef.current) {
        speechSynthesis.cancel()
      }

      utteranceRef.current = createSpeechSynthesis(text, settings)

      let segmentIndex = 0
      const segments = segmentsRef.current
      const segmentDuration = (text.length / 100) * 1000

      utteranceRef.current.onstart = () => {
        setState((prev) => ({ ...prev, isPlaying: true, isPaused: false }))
      }

      utteranceRef.current.onend = () => {
        setState((prev) => ({ ...prev, isPlaying: false, isPaused: false, currentSegmentIndex: -1 }))
      }

      utteranceRef.current.onerror = () => {
        setState((prev) => ({ ...prev, isPlaying: false, isPaused: false }))
      }

      speechSynthesis.speak(utteranceRef.current)

      const segmentInterval = setInterval(() => {
        if (segmentIndex < segments.length) {
          setState((prev) => ({ ...prev, currentSegmentIndex: segmentIndex }))
          segmentIndex++
        } else {
          clearInterval(segmentInterval)
        }
      }, segmentDuration / segments.length)
    }
  }, [text, settings])

  const pause = useCallback(() => {
    if (customPlayerRef.current) {
      customPlayerRef.current.pause()
      setState((prev) => ({ ...prev, isPaused: true, isPlaying: false }))
    } else {
      speechSynthesis.pause()
      setState((prev) => ({ ...prev, isPaused: true, isPlaying: false }))
    }
  }, [])

  const resume = useCallback(() => {
    if (customPlayerRef.current) {
      customPlayerRef.current.resume()
      setState((prev) => ({ ...prev, isPaused: false, isPlaying: true }))
    } else {
      speechSynthesis.resume()
      setState((prev) => ({ ...prev, isPaused: false, isPlaying: true }))
    }
  }, [])

  const stop = useCallback(() => {
    if (customPlayerRef.current) {
      customPlayerRef.current.stop()
    }

    if (utteranceRef.current) {
      speechSynthesis.cancel()
    }

    setState({
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
      duration: 0,
      currentSegmentIndex: -1,
    })
  }, [])

  const seek = useCallback((time: number) => {
    if (customPlayerRef.current) {
      customPlayerRef.current.seek(time)
      setState((prev) => ({ ...prev, currentTime: time }))
    }
  }, [])

  return {
    state,
    play,
    pause,
    resume,
    stop,
    seek,
  }
}
