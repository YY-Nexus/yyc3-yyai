export interface Subject {
  id: string
  name: string
  description: string
  icon: string
  color: string
  levels: string[]
  topics: Topic[]
}

export interface Topic {
  id: string
  name: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedTime: number // 分钟
  prerequisites?: string[]
}

export interface LearningProgress {
  subjectId: string
  topicId: string
  progress: number // 0-100
  lastStudied: Date
  score?: number
  timeSpent: number // 分钟
}

export const subjects: Subject[] = [
  {
    id: "chinese",
    name: "语文",
    description: "中文语言文学学习",
    icon: "📚",
    color: "red",
    levels: ["小学", "初中", "高中"],
    topics: [
      {
        id: "poetry",
        name: "古诗词",
        description: "古典诗词赏析与背诵",
        difficulty: "intermediate",
        estimatedTime: 45,
      },
      {
        id: "composition",
        name: "作文写作",
        description: "记叙文、议论文、说明文写作技巧",
        difficulty: "intermediate",
        estimatedTime: 60,
      },
      {
        id: "reading",
        name: "阅读理解",
        description: "文章理解与分析能力培养",
        difficulty: "beginner",
        estimatedTime: 30,
      },
    ],
  },
  {
    id: "math",
    name: "数学",
    description: "数学基础与应用",
    icon: "🔢",
    color: "blue",
    levels: ["小学", "初中", "高中"],
    topics: [
      {
        id: "arithmetic",
        name: "基础运算",
        description: "加减乘除与四则运算",
        difficulty: "beginner",
        estimatedTime: 30,
      },
      {
        id: "algebra",
        name: "代数",
        description: "方程式与不等式",
        difficulty: "intermediate",
        estimatedTime: 45,
      },
      {
        id: "geometry",
        name: "几何",
        description: "平面与立体几何",
        difficulty: "intermediate",
        estimatedTime: 50,
      },
    ],
  },
  {
    id: "math-competition",
    name: "奥数竞赛",
    description: "数学竞赛专项训练",
    icon: "🏆",
    color: "gold",
    levels: ["小学组", "初中组", "高中组"],
    topics: [
      {
        id: "number-theory",
        name: "数论",
        description: "质数、最大公约数、同余理论",
        difficulty: "advanced",
        estimatedTime: 90,
      },
      {
        id: "combinatorics",
        name: "组合数学",
        description: "排列组合、概率统计",
        difficulty: "advanced",
        estimatedTime: 75,
      },
      {
        id: "competition-geometry",
        name: "竞赛几何",
        description: "几何证明与构造",
        difficulty: "advanced",
        estimatedTime: 80,
      },
    ],
  },
  {
    id: "english",
    name: "英语",
    description: "英语语言学习",
    icon: "🌍",
    color: "green",
    levels: ["小学", "初中", "高中"],
    topics: [
      {
        id: "vocabulary",
        name: "词汇积累",
        description: "单词记忆与应用",
        difficulty: "beginner",
        estimatedTime: 25,
      },
      {
        id: "grammar",
        name: "语法学习",
        description: "英语语法规则与应用",
        difficulty: "intermediate",
        estimatedTime: 40,
      },
      {
        id: "speaking",
        name: "口语练习",
        description: "英语口语表达能力",
        difficulty: "intermediate",
        estimatedTime: 35,
      },
    ],
  },
  {
    id: "science",
    name: "科学",
    description: "自然科学综合学习",
    icon: "🔬",
    color: "purple",
    levels: ["小学", "初中", "高中"],
    topics: [
      {
        id: "physics",
        name: "物理",
        description: "物理现象与规律",
        difficulty: "intermediate",
        estimatedTime: 50,
      },
      {
        id: "chemistry",
        name: "化学",
        description: "化学反应与元素",
        difficulty: "intermediate",
        estimatedTime: 45,
      },
      {
        id: "biology",
        name: "生物",
        description: "生命科学基础",
        difficulty: "beginner",
        estimatedTime: 40,
      },
    ],
  },
  {
    id: "arts",
    name: "艺术",
    description: "艺术创作与欣赏",
    icon: "🎨",
    color: "pink",
    levels: ["启蒙", "基础", "进阶"],
    topics: [
      {
        id: "drawing",
        name: "绘画",
        description: "素描、色彩、创意绘画",
        difficulty: "beginner",
        estimatedTime: 60,
      },
      {
        id: "music",
        name: "音乐",
        description: "音乐理论与欣赏",
        difficulty: "beginner",
        estimatedTime: 45,
      },
      {
        id: "design",
        name: "设计",
        description: "创意设计思维培养",
        difficulty: "intermediate",
        estimatedTime: 55,
      },
    ],
  },
]

export const learningObjectives = {
  chinese: {
    primary: "培养中文语言文学素养，提高阅读理解和写作能力",
    skills: ["阅读理解", "写作表达", "文学鉴赏", "语言运用"],
  },
  math: {
    primary: "建立数学思维，掌握数学基础知识和解题方法",
    skills: ["逻辑推理", "计算能力", "空间想象", "问题解决"],
  },
  "math-competition": {
    primary: "培养数学竞赛能力，冲击各类数学竞赛奖项",
    skills: ["高级数学思维", "竞赛技巧", "创新解题", "时间管理"],
  },
  english: {
    primary: "全面提升英语听说读写能力，培养国际视野",
    skills: ["听力理解", "口语表达", "阅读能力", "写作技巧"],
  },
  science: {
    primary: "培养科学思维和探索精神，理解自然规律",
    skills: ["观察能力", "实验技能", "科学推理", "创新思维"],
  },
  arts: {
    primary: "培养艺术审美和创作能力，提升综合素养",
    skills: ["审美能力", "创意思维", "表达技巧", "文化理解"],
  },
}
