"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Volume2, VolumeX, Pause, Play, RotateCcw, Upload } from "lucide-react"
import { VOICE_TYPE_CONFIG, type VoiceSettings } from "@/lib/voice-settings"

interface VoiceControlPanelProps {
  settings: VoiceSettings
  onSettingsChange: (settings: VoiceSettings) => void
  control: {
    isPlaying: boolean
    isPaused: boolean
    currentTime: number
    duration: number
  }
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  onSeek: (time: number) => void
  onReplay: () => void
}

export function VoiceControlPanel({
  settings,
  onSettingsChange,
  control,
  onPlay,
  onPause,
  onStop,
  onSeek,
  onReplay,
}: VoiceControlPanelProps) {
  const [customVoiceFile, setCustomVoiceFile] = useState<File | null>(null)

  const handleVoiceTypeChange = (value: string) => {
    onSettingsChange({
      ...settings,
      voiceType: value as VoiceSettings["voiceType"],
    })
  }

  const handleSpeedChange = (value: string) => {
    onSettingsChange({
      ...settings,
      speed: value as VoiceSettings["speed"],
    })
  }

  const handleToneChange = (value: string) => {
    onSettingsChange({
      ...settings,
      tone: value as VoiceSettings["tone"],
    })
  }

  const handleToggleEnabled = () => {
    onSettingsChange({
      ...settings,
      enabled: !settings.enabled,
    })
  }

  const handleCustomVoiceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCustomVoiceFile(file)
      const url = URL.createObjectURL(file)
      onSettingsChange({
        ...settings,
        voiceType: "custom",
        customVoiceUrl: url,
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="w-full bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-cyan-400 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            语音控制面板
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleEnabled}
            className={settings.enabled ? "text-cyan-400" : "text-slate-500"}
          >
            {settings.enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 语音类型选择 */}
        <div className="space-y-2">
          <Label className="text-slate-300">语音类型</Label>
          <Select value={settings.voiceType} onValueChange={handleVoiceTypeChange}>
            <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {Object.entries(VOICE_TYPE_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key} className="text-slate-200">
                  <span className="flex items-center gap-2">
                    <span>{config.icon}</span>
                    <span>{config.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 自定义语音上传 */}
        {settings.voiceType === "custom" && (
          <div className="space-y-2">
            <Label className="text-slate-300">上传自定义语音</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-slate-700/50 border-slate-600/50 text-slate-200 hover:bg-slate-600/50"
                onClick={() => document.getElementById("voice-upload")?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                选择文件
              </Button>
              <input
                id="voice-upload"
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleCustomVoiceUpload}
              />
            </div>
            {customVoiceFile && <p className="text-xs text-slate-400">已选择: {customVoiceFile.name}</p>}
          </div>
        )}

        {/* 语速调节 */}
        <div className="space-y-2">
          <Label className="text-slate-300">语速</Label>
          <Select value={settings.speed} onValueChange={handleSpeedChange}>
            <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="slow" className="text-slate-200">
                🐢 慢速
              </SelectItem>
              <SelectItem value="normal" className="text-slate-200">
                ⚡ 正常
              </SelectItem>
              <SelectItem value="fast" className="text-slate-200">
                🚀 快速
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 音调调节 */}
        <div className="space-y-2">
          <Label className="text-slate-300">音调</Label>
          <Select value={settings.tone} onValueChange={handleToneChange}>
            <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="calm" className="text-slate-200">
                😌 平静
              </SelectItem>
              <SelectItem value="lively" className="text-slate-200">
                😊 活泼
              </SelectItem>
              <SelectItem value="composed" className="text-slate-200">
                🎯 沉稳
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 播放控制 */}
        <div className="space-y-3">
          <Label className="text-slate-300">播放控制</Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={control.isPlaying && !control.isPaused ? onPause : onPlay}
              disabled={!settings.enabled}
              className="flex-1 bg-slate-700/50 border-slate-600/50 text-slate-200 hover:bg-slate-600/50 disabled:opacity-30"
            >
              {control.isPlaying && !control.isPaused ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  暂停
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  播放
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onStop}
              disabled={!settings.enabled || !control.isPlaying}
              className="bg-slate-700/50 border-slate-600/50 text-slate-200 hover:bg-slate-600/50 disabled:opacity-30"
            >
              <VolumeX className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onReplay}
              disabled={!settings.enabled}
              className="bg-slate-700/50 border-slate-600/50 text-slate-200 hover:bg-slate-600/50 disabled:opacity-30"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 进度条 */}
        {control.duration > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>{formatTime(control.currentTime)}</span>
              <span>{formatTime(control.duration)}</span>
            </div>
            <Slider
              value={[control.currentTime]}
              max={control.duration}
              step={0.1}
              onValueChange={([value]) => onSeek(value)}
              disabled={!settings.enabled || !control.isPlaying}
              className="cursor-pointer"
            />
          </div>
        )}

        {/* 提示信息 */}
        <div className="text-xs text-slate-400 bg-slate-700/30 rounded-lg p-3 space-y-1">
          <p>💡 提示：</p>
          <p>• 选择不同的语音类型体验不同风格</p>
          <p>• 调整语速和音调让学习更舒适</p>
          <p>• 可上传自己录制的语音作为AI回答</p>
        </div>
      </CardContent>
    </Card>
  )
}
