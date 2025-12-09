// 系统架构配置 - 分层分类设计

export interface PromptTemplate {
  id: string
  name: string
  description: string
  template: string
  variables?: string[]
  examples?: string[]
}

export interface FunctionModule {
  id: string
  name: string
  description: string
  layer: SystemLayer
  category: FunctionCategory
  complexity: ComplexityLevel
  userRole: UserRole[]
  prompts: PromptTemplate[]
  keywords: string[]
  subModules?: FunctionModule[]
}

// 系统分层定义
export enum SystemLayer {
  CORE = "core", // 核心层 - 基础AI能力
  BUSINESS = "business", // 业务层 - 业务逻辑处理
  APPLICATION = "application", // 应用层 - 具体功能实现
  INTERACTION = "interaction", // 交互层 - 用户界面交互
}

// 功能分类定义
export enum FunctionCategory {
  CREATIVE = "creative", // 创意创作
  ANALYTICS = "analytics", // 数据分析
  MANAGEMENT = "management", // 管理运营
  COMMUNICATION = "communication", // 沟通协作
  SYSTEM = "system", // 系统功能
  AUTOMATION = "automation", // 自动化
}

// 复杂度等级
export enum ComplexityLevel {
  BASIC = "basic", // 基础 - 简单操作
  INTERMEDIATE = "intermediate", // 中级 - 需要一定配置
  ADVANCED = "advanced", // 高级 - 复杂业务逻辑
  EXPERT = "expert", // 专家 - 需要专业知识
}

// 用户角色
export enum UserRole {
  GENERAL = "general", // 普通用户
  BUSINESS = "business", // 商务用户
  CREATIVE = "creative", // 创意用户
  TECHNICAL = "technical", // 技术用户
  ADMIN = "admin", // 管理员
}

// 智能提示词匹配系统
export class PromptMatcher {
  private modules: FunctionModule[]

  constructor(modules: FunctionModule[]) {
    this.modules = modules
  }

  // 根据用户输入匹配最佳功能模块
  matchModule(userInput: string, userRole: UserRole = UserRole.GENERAL): FunctionModule | null {
    const lowerInput = userInput.toLowerCase()

    // 权重计算
    const matches = this.modules.map((module) => {
      let score = 0

      // 关键词匹配
      const keywordMatches = module.keywords.filter((keyword) => lowerInput.includes(keyword.toLowerCase())).length
      score += keywordMatches * 10

      // 用户角色匹配
      if (module.userRole.includes(userRole)) {
        score += 5
      }

      // 复杂度适配（普通用户偏好简单功能）
      if (userRole === UserRole.GENERAL && module.complexity === ComplexityLevel.BASIC) {
        score += 3
      }

      return { module, score }
    })

    // 返回得分最高的模块
    const bestMatch = matches.reduce((best, current) => (current.score > best.score ? current : best))

    return bestMatch.score > 0 ? bestMatch.module : null
  }

  // 获取智能建议
  getSuggestions(userInput: string, userRole: UserRole = UserRole.GENERAL): any[] {
    const suggestions: any[] = []
    const lowerInput = userInput.toLowerCase()

    // 创意相关建议
    if (["创意", "设计", "文案", "图片", "视频"].some((keyword) => lowerInput.includes(keyword))) {
      suggestions.push({
        title: "言启万象",
        description: "AI创意内容生成",
        icon: "✨",
        action: "启动言启万象创意中心",
      })
    }

    // 数据相关建议
    if (["数据", "分析", "报表", "统计"].some((keyword) => lowerInput.includes(keyword))) {
      suggestions.push({
        title: "数据魔方",
        description: "智能数据分析",
        icon: "📊",
        action: "打开数据魔方分析中心",
      })
    }

    // 客户相关建议
    if (["客户", "CRM", "管理"].some((keyword) => lowerInput.includes(keyword))) {
      suggestions.push({
        title: "客资系统",
        description: "客户资源管理",
        icon: "👥",
        action: "启动客资系统管理中心",
      })
    }

    return suggestions.slice(0, 3)
  }
}

// 导出配置实例
export const systemArchitecture = new PromptMatcher([])
