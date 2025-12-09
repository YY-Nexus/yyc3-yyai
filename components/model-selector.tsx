"use client"

import { useState } from "react"
import { Check, ChevronDown, Cpu, Cloud, Zap, Brain } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { useLocalModels } from "@/hooks/use-local-models"

interface ModelOption {
  id: string
  name: string
  description: string
  type: "cloud" | "local"
  provider?: string
  capabilities?: string[]
  modelSize?: string
}

interface ModelSelectorProps {
  value: string
  onValueChange: (value: string) => void
  onModelSelect?: (model: ModelOption) => void
}

export function ModelSelector({ value, onValueChange, onModelSelect }: ModelSelectorProps) {
  const [open, setOpen] = useState(false)
  const { localModels, isLoading, getModelStatus } = useLocalModels()

  // 云端模型配置
  const cloudModels: ModelOption[] = [
    {
      id: "gpt-4",
      name: "GPT-4",
      description: "最强推理能力，适合复杂问题",
      type: "cloud",
      provider: "OpenAI",
      capabilities: ["推理", "创作", "代码", "多语言"],
    },
    {
      id: "gpt-3.5",
      name: "GPT-3.5 Turbo",
      description: "快速响应，性价比高",
      type: "cloud",
      provider: "OpenAI",
      capabilities: ["对话", "创作", "翻译"],
    },
    {
      id: "claude-3",
      name: "Claude-3",
      description: "长文本处理专家",
      type: "cloud",
      provider: "Anthropic",
      capabilities: ["长文本", "分析", "创作"],
    },
    {
      id: "gemini-pro",
      name: "Gemini Pro",
      description: "多模态理解能力",
      type: "cloud",
      provider: "Google",
      capabilities: ["多模态", "推理", "代码"],
    },
    {
      id: "jimeng-ai",
      name: "即梦AI",
      description: "创意生成专家",
      type: "cloud",
      provider: "即梦AI",
      capabilities: ["创意", "图像", "设计"],
    },
  ]

  // 转换本地模型格式
  const localModelOptions: ModelOption[] = localModels.map((model) => ({
    id: model.id,
    name: model.name,
    description: model.description,
    type: "local" as const,
    provider: model.provider,
    capabilities: model.capabilities,
    modelSize: model.modelSize,
  }))

  const allModels = [...cloudModels, ...localModelOptions]
  const selectedModel = allModels.find((model) => model.id === value)
  const modelStatus = getModelStatus()

  const handleSelect = (modelId: string) => {
    const model = allModels.find((m) => m.id === modelId)
    if (model) {
      onValueChange(modelId)
      onModelSelect?.(model)
      setOpen(false)
    }
  }

  const getModelIcon = (type: string, provider?: string) => {
    if (type === "local") {
      return <Cpu className="h-4 w-4 text-orange-500" />
    }
    if (provider === "即梦AI") {
      return <Brain className="h-4 w-4 text-purple-500" />
    }
    return <Cloud className="h-4 w-4 text-blue-500" />
  }

  const getProviderBadge = (type: string, provider?: string) => {
    if (type === "local") {
      return (
        <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
          本地
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
        云端
      </Badge>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between text-xs bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50"
        >
          <div className="flex items-center space-x-2">
            {selectedModel && getModelIcon(selectedModel.type, selectedModel.provider)}
            <span className="truncate">{selectedModel ? selectedModel.name : "选择模型"}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 bg-slate-800 border-slate-700">
        <Command className="bg-slate-800">
          <CommandInput placeholder="搜索模型..." className="text-slate-300 placeholder:text-slate-500" />
          <CommandList>
            <CommandEmpty className="text-slate-400 text-center py-6">
              {isLoading ? "正在加载模型..." : "未找到模型"}
            </CommandEmpty>

            {/* 云端模型 */}
            <CommandGroup heading="云端模型" className="text-slate-400">
              {cloudModels.map((model) => (
                <CommandItem
                  key={model.id}
                  value={model.id}
                  onSelect={() => handleSelect(model.id)}
                  className="text-slate-300 hover:bg-slate-700/50 cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                      {getModelIcon(model.type, model.provider)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{model.name}</span>
                          {getProviderBadge(model.type, model.provider)}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{model.description}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {model.capabilities?.slice(0, 3).map((cap) => (
                            <Badge key={cap} variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Check
                      className={`ml-auto h-4 w-4 ${value === model.id ? "opacity-100 text-cyan-400" : "opacity-0"}`}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>

            {/* 本地模型 */}
            {localModelOptions.length > 0 && (
              <CommandGroup heading="本地模型" className="text-slate-400">
                {localModelOptions.map((model) => (
                  <CommandItem
                    key={model.id}
                    value={model.id}
                    onSelect={() => handleSelect(model.id)}
                    className="text-slate-300 hover:bg-slate-700/50 cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-3">
                        {getModelIcon(model.type, model.provider)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{model.name}</span>
                            {getProviderBadge(model.type, model.provider)}
                            {model.modelSize && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                {model.modelSize}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{model.description}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {model.capabilities?.slice(0, 3).map((cap) => (
                              <Badge key={cap} variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                                {cap}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Check
                        className={`ml-auto h-4 w-4 ${value === model.id ? "opacity-100 text-cyan-400" : "opacity-0"}`}
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>

          {/* 状态信息 */}
          <div className="border-t border-slate-700 p-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center space-x-2">
                <Zap className="h-3 w-3" />
                <span>
                  {modelStatus.totalModels > 0 ? `${modelStatus.totalModels} 个本地模型可用` : "未检测到本地模型"}
                </span>
              </div>
              {modelStatus.lastChecked && <span>{modelStatus.lastChecked.toLocaleTimeString()}</span>}
            </div>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
