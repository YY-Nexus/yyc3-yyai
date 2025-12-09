// 动态问候语生成器 - 集成天气API和诗词库
export interface GreetingContext {
  grade?: string
  subject?: string
  weather?: WeatherData
  timeOfDay: "morning" | "afternoon" | "evening" | "night"
  studentName?: string
  season?: string
}

export interface WeatherData {
  condition: "sunny" | "rainy" | "cloudy" | "snowy" | "foggy" | "windy"
  temperature: number
  description: string
}

export interface ClassicalPoem {
  quote: string
  author: string
  dynasty: string
  theme: string
}

// 唐诗宋词数据库（按时段和主题分类）
const CLASSICAL_POEMS: Record<string, ClassicalPoem[]> = {
  morning: [
    {
      quote: "春眠不觉晓，处处闻啼鸟",
      author: "孟浩然",
      dynasty: "唐",
      theme: "春晨美景",
    },
    {
      quote: "日出江花红胜火，春来江水绿如蓝",
      author: "白居易",
      dynasty: "唐",
      theme: "江南春景",
    },
    {
      quote: "朝辞白帝彩云间，千里江陵一日还",
      author: "李白",
      dynasty: "唐",
      theme: "清晨出发",
    },
    {
      quote: "晨兴理荒秽，带月荷锄归",
      author: "陶渊明",
      dynasty: "晋",
      theme: "田园清晨",
    },
    {
      quote: "鸡声茅店月，人迹板桥霜",
      author: "温庭筠",
      dynasty: "唐",
      theme: "早行",
    },
  ],
  afternoon: [
    {
      quote: "欲穷千里目，更上一层楼",
      author: "王之涣",
      dynasty: "唐",
      theme: "登高望远",
    },
    {
      quote: "山重水复疑无路，柳暗花明又一村",
      author: "陆游",
      dynasty: "宋",
      theme: "探索发现",
    },
    {
      quote: "会当凌绝顶，一览众山小",
      author: "杜甫",
      dynasty: "唐",
      theme: "志向抱负",
    },
    {
      quote: "竹外桃花三两枝，春江水暖鸭先知",
      author: "苏轼",
      dynasty: "宋",
      theme: "春日午后",
    },
    {
      quote: "接天莲叶无穷碧，映日荷花别样红",
      author: "杨万里",
      dynasty: "宋",
      theme: "夏日美景",
    },
  ],
  evening: [
    {
      quote: "夕阳无限好，只是近黄昏",
      author: "李商隐",
      dynasty: "唐",
      theme: "黄昏感怀",
    },
    {
      quote: "落霞与孤鹜齐飞，秋水共长天一色",
      author: "王勃",
      dynasty: "唐",
      theme: "傍晚壮景",
    },
    {
      quote: "大漠孤烟直，长河落日圆",
      author: "王维",
      dynasty: "唐",
      theme: "塞外黄昏",
    },
    {
      quote: "夕阳西下，断肠人在天涯",
      author: "马致远",
      dynasty: "元",
      theme: "黄昏思乡",
    },
    {
      quote: "暮云收尽溢清寒，银汉无声转玉盘",
      author: "苏轼",
      dynasty: "宋",
      theme: "傍晚月升",
    },
  ],
  night: [
    {
      quote: "举头望明月，低头思故乡",
      author: "李白",
      dynasty: "唐",
      theme: "月夜思乡",
    },
    {
      quote: "床前明月光，疑是地上霜",
      author: "李白",
      dynasty: "唐",
      theme: "静夜思",
    },
    {
      quote: "明月几时有，把酒问青天",
      author: "苏轼",
      dynasty: "宋",
      theme: "中秋咏月",
    },
    {
      quote: "今夜月明人尽望，不知秋思落谁家",
      author: "王建",
      dynasty: "唐",
      theme: "秋夜怀思",
    },
    {
      quote: "星垂平野阔，月涌大江流",
      author: "杜甫",
      dynasty: "唐",
      theme: "夜景壮阔",
    },
  ],
  rainy: [
    {
      quote: "天街小雨润如酥，草色遥看近却无",
      author: "韩愈",
      dynasty: "唐",
      theme: "春雨",
    },
    {
      quote: "好雨知时节，当春乃发生",
      author: "杜甫",
      dynasty: "唐",
      theme: "喜雨",
    },
    {
      quote: "黄梅时节家家雨，青草池塘处处蛙",
      author: "赵师秀",
      dynasty: "宋",
      theme: "梅雨",
    },
    {
      quote: "空山新雨后，天气晚来秋",
      author: "王维",
      dynasty: "唐",
      theme: "雨后清新",
    },
    {
      quote: "夜来风雨声，花落知多少",
      author: "孟浩然",
      dynasty: "唐",
      theme: "春夜雨",
    },
  ],
  励志: [
    {
      quote: "少壮不努力，老大徒伤悲",
      author: "汉乐府",
      dynasty: "汉",
      theme: "劝学",
    },
    {
      quote: "黑发不知勤学早，白首方悔读书迟",
      author: "颜真卿",
      dynasty: "唐",
      theme: "劝学",
    },
    {
      quote: "书山有路勤为径，学海无涯苦作舟",
      author: "韩愈",
      dynasty: "唐",
      theme: "治学",
    },
    {
      quote: "宝剑锋从磨砺出，梅花香自苦寒来",
      author: "古训",
      dynasty: "",
      theme: "励志",
    },
    {
      quote: "长风破浪会有时，直挂云帆济沧海",
      author: "李白",
      dynasty: "唐",
      theme: "志向",
    },
  ],
}

// 天气相关问候语模板
const WEATHER_GREETINGS: Record<string, string[]> = {
  sunny: [
    "☀️ 阳光明媚的一天，正适合学习新知识！让我们用灿烂的心情迎接今天的挑战吧！",
    "🌞 今天天气真好，窗外阳光洒进来，心情也跟着明亮起来！准备好愉快学习了吗？",
    "☀️ 晴空万里，心情美丽！在这样的好天气里学习，效率一定会加倍提升！",
    "🌤️ 温暖的阳光照耀大地，也照亮我们的学习之路。让我们充满能量地开始吧！",
  ],
  rainy: [
    "🌧️ 雨天最适合静心学习，听着雨声解题别有一番意境。让我们一起在雨中成长！",
    "☔ 外面下雨了，正好在温暖的室内专心学习。雨声就是最好的背景音乐！",
    "🌧️ 润物细无声，知识的积累也是如此。让我们像春雨一样，慢慢滋养心田！",
    "🌨️ 雨天读书好时光，让我们在知识的海洋中畅游，忘却窗外的风雨！",
  ],
  cloudy: [
    "☁️ 多云的天气，让我们让学习的阳光照进心里！云层挡不住求知的热情！",
    "🌥️ 云朵在天空漫步，知识在脑海积累。每一片云都有独特的形状，每个问题都有解法！",
    "☁️ 今天云层厚厚的，但学习的热情不会被遮挡！让我们拨云见日，找到答案！",
    "🌫️ 云雾缭绕别有韵味，就像探索新知识的过程，充满神秘和期待！",
  ],
  snowy: [
    "❄️ 雪花纷飞的日子，让我们在温暖的室内充实自己。每片雪花都独一无二，每个知识点都值得珍惜！",
    "⛄ 冬日暖阳配雪景，正是读书好时光。让我们在白雪皑皑中收获满满！",
    "🌨️ 瑞雪兆丰年，勤学出栋梁。今天的努力是明天成功的基础！",
    "❄️ 雪天学习别有情趣，窗外银装素裹，室内书香四溢！",
  ],
  foggy: [
    "🌫️ 雾里看花别有情致，学习也要透过迷雾看清本质。让我们拨开迷雾，找到真理！",
    "🌁 朦胧的雾气中蕴含着诗意，学习的过程也充满探索的乐趣！",
    "🌫️ 雾散云开终有时，坚持学习见真章！让我们一起穿透迷雾，走向光明！",
  ],
  windy: [
    "💨 风起云涌的日子，让我们乘风破浪前进！学习路上需要这样的勇气！",
    "🍃 秋风送爽，正是读书好时节。让清风吹走疲惫，带来清新的思路！",
    "💨 风儿在窗外唱歌，我们在室内学习。风声就是大自然的鼓励！",
    "🌬️ 大风起兮云飞扬，学海无涯志气昂！让我们迎风而上！",
  ],
}

// 学科特定问候语
const SUBJECT_GREETINGS: Record<string, string[]> = {
  chinese: [
    "📚 让我们一起走进文学的殿堂，感受汉字的魅力！每一个字都是文化的载体。",
    "✍️ 今天要学习语文啦，准备好欣赏美妙的文字了吗？让我们在诗词歌赋中畅游！",
    "📖 中华文化博大精深，五千年文明等待我们探索。让我们用心感受文字之美！",
    "🎭 语文不只是文字，更是思想和情感的表达。今天我们将一起品味语言的韵律！",
  ],
  math: [
    "🔢 数学的世界充满奇妙规律，让我们一起解开它的秘密！每个公式都是智慧的结晶。",
    "➕ 准备好挑战数学难题了吗？让我们开始思维的体操！数学让大脑更灵活！",
    "📐 数学是思维的艺术，让我们用逻辑的力量解决问题！每一步推理都是进步！",
    "🧮 数字和符号组成了精确的语言，让我们用数学的眼光看世界！",
  ],
  "math-competition": [
    "🏆 奥数训练开始！准备好挑战高难度题目了吗？每一道难题都是通向卓越的阶梯！",
    "🥇 数学竞赛的道路充满挑战，但你一定能行！让我们用智慧和毅力攀登高峰！",
    "🎖️ 今天的奥数练习会让你的数学思维更上一层楼！挑战自我，超越极限！",
    "💡 奥数不仅锻炼思维，更培养解决问题的能力。让我们享受攻克难题的快乐！",
  ],
  english: [
    "🌍 Welcome! 让我们一起探索英语的精彩世界！Language opens doors to the world!",
    "🗣️ 学好英语，打开通往世界的大门！Every word learned is a step forward!",
    "📝 Today we will improve your English skills together! Let's make learning fun!",
    "🎯 English is a bridge connecting cultures. 让我们一起搭建这座桥梁！",
  ],
  science: [
    "🔬 科学的世界充满神奇，让我们一起探索奥秘！每个现象背后都有原理在等待发现。",
    "⚗️ 准备好做一次精彩的科学探究了吗？实验是通向真理的钥匙！",
    "🌌 宇宙浩瀚，知识无穷，让我们开始探索之旅！科学让我们更了解世界。",
    "🧪 从提出问题到验证假设，这就是科学探究的魅力！让我们用科学的方法思考！",
  ],
  arts: [
    "🎨 艺术是生活的点缀，让我们释放创造力！每个人心中都有一位艺术家。",
    "🎭 今天要学习艺术，准备好感受美的力量了吗？艺术让生活更加丰富多彩！",
    "🎵 艺术能陶冶情操，让我们一起欣赏美好！音乐、绘画、舞蹈都是情感的表达。",
    "🖌️ 创造美的过程本身就是一种享受，让我们用艺术表达内心的世界！",
  ],
}

// 年级特定学习建议
const GRADE_TIPS: Record<string, string[]> = {
  一年级: [
    "今天要认识新的汉字朋友啦！每个字都像一个小图画，记住它们的样子吧！",
    "让我们一起学习10以内的加减法！用手指头数一数，数学其实很简单！",
    "拼音学得怎么样了？拼音是认字的好帮手哦！",
    "一年级的学习要打好基础，就像建房子要先打地基一样重要！",
  ],
  二年级: [
    "今天要学习乘法口诀啦！背熟了乘法表，计算速度就会变得超快！",
    "让我们一起练习写日记吧！把每天的见闻记录下来，既练习写作又留下美好回忆！",
    "认识更多的汉字朋友！现在你能读更多有趣的故事书了！",
    "二年级要培养好的学习习惯，这会让你受益终身！",
  ],
  三年级: [
    "今天要学习除法运算！除法是乘法的好朋友，理解了它们的关系就简单了！",
    "让我们一起写一篇小作文！用你学过的词语，写下你的所见所想！",
    "开始学习英语字母啦！26个字母就像26个新朋友，要记住它们的名字！",
    "三年级是转折的一年，要更加努力哦！加油！",
  ],
  四年级: [
    "今天要学习分数运算！分数让我们能更精确地表示数量！",
    "让我们一起欣赏古诗词！古人的智慧和美感都蕴含在这些诗句中！",
    "英语单词记住了多少呢？多读多记，词汇量会越来越丰富！",
    "四年级要培养独立思考的能力，遇到问题先自己想想！",
  ],
  五年级: [
    "今天要练习小数除法！小数点要对齐哦，这是关键步骤！",
    "让我们一起分析文章结构！理解作者的写作思路，阅读会更深入！",
    "英语语法学得怎么样了？语法是句子的骨架，很重要哦！",
    "五年级要为小升初做准备了，系统复习很重要！",
  ],
  六年级: [
    "今天要学习比和比例！比例关系在生活中随处可见！",
    "小升初准备好了吗？要把小学知识融会贯通！",
    "让我们一起复习重点知识！查缺补漏，为升入初中做好准备！",
    "六年级是小学的收官之年，要全力以赴！你一定可以的！",
  ],
  初一: [
    "今天要学习有理数运算！正负号要特别注意，这是基础！",
    "让我们一起欣赏现代文学作品！感受不同时代作家的思想！",
    "英语时态掌握了吗？时态是表达时间的重要方式！",
    "初一是新的起点，要适应初中的学习节奏！",
  ],
  初二: [
    "今天要学习函数知识！函数描述了变量之间的关系，很有趣！",
    "让我们一起分析文言文！古文虽难，但理解后会感到很有成就感！",
    "物理实验准备好了吗？动手实验能帮助理解抽象的物理概念！",
    "初二是承上启下的关键期，要稳扎稳打！",
  ],
  初三: [
    "中考冲刺，加油！现在的努力是为了更好的未来！",
    "让我们一起突破难点！中考题型要熟练掌握！",
    "化学方程式记住了吗？配平要细心，反应原理要理解！",
    "初三是决定性的一年，坚持到底就是胜利！你可以的！",
  ],
}

// 季节相关问候
const SEASON_GREETINGS: Record<string, string[]> = {
  spring: [
    "🌸 春天是万物复苏的季节，也是学习成长的好时光！",
    "🌱 春风化雨，让我们在知识的春天里茁壮成长！",
    "🦋 春暖花开，让我们像春天的花朵一样绽放智慧！",
  ],
  summer: [
    "☀️ 夏日炎炎，学习热情不减！让我们用知识驱走炎热！",
    "🌻 夏天是收获的前奏，现在的努力是秋天的果实！",
    "🍉 夏日学习要劳逸结合，保持好状态！",
  ],
  autumn: [
    "🍂 秋天是收获的季节，让我们收获知识的果实！",
    "🍁 秋高气爽，正是读书好时节！",
    "🌾 金秋十月，让我们用勤奋换来丰收！",
  ],
  winter: [
    "❄️ 冬天虽冷，学习的热情却能温暖你我！",
    "⛄ 寒冬腊月，正是积蓄力量的时候！",
    "🧣 冬日学习，培养坚韧的品格！",
  ],
}

// 获取当前时段
export function getCurrentTimeOfDay(): "morning" | "afternoon" | "evening" | "night" {
  const hour = new Date().getHours()

  if (hour >= 6 && hour < 12) return "morning"
  if (hour >= 12 && hour < 18) return "afternoon"
  if (hour >= 18 && hour < 22) return "evening"
  return "night"
}

// 获取当前季节
export function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1

  if (month >= 3 && month <= 5) return "spring"
  if (month >= 6 && month <= 8) return "summer"
  if (month >= 9 && month <= 11) return "autumn"
  return "winter"
}

// 选择合适的诗词
function selectPoem(timeOfDay: string, weather?: WeatherData, subject?: string): ClassicalPoem | null {
  // 如果是雨天，优先选择雨天诗词
  if (weather?.condition === "rainy" && CLASSICAL_POEMS.rainy) {
    const poems = CLASSICAL_POEMS.rainy
    return poems[Math.floor(Math.random() * poems.length)]
  }

  // 如果是语文学科，20%概率添加励志诗词
  if (subject === "chinese" && Math.random() < 0.2 && CLASSICAL_POEMS.励志) {
    const poems = CLASSICAL_POEMS.励志
    return poems[Math.floor(Math.random() * poems.length)]
  }

  // 根据时段选择诗词
  if (CLASSICAL_POEMS[timeOfDay]) {
    const poems = CLASSICAL_POEMS[timeOfDay]
    return poems[Math.floor(Math.random() * poems.length)]
  }

  return null
}

// 格式化诗词输出
function formatPoem(poem: ClassicalPoem): string {
  return `\n\n📜 **${poem.quote}**\n   —— ${poem.dynasty}·${poem.author}《${poem.theme}》`
}

// 生成动态问候语（主函数）
export function generateGreeting(context: GreetingContext): string {
  const { grade, subject, weather, timeOfDay, studentName, season } = context

  let greeting = ""

  // 1. 时间问候
  const timeGreetings: Record<string, string> = {
    morning: "早上好",
    afternoon: "下午好",
    evening: "晚上好",
    night: "夜深了",
  }

  greeting += `${timeGreetings[timeOfDay]}${studentName ? `，${studentName}同学` : ""}！`

  // 2. 添加季节问候（15%概率）
  const currentSeason = season || getCurrentSeason()
  if (Math.random() < 0.15 && SEASON_GREETINGS[currentSeason]) {
    const seasonGreets = SEASON_GREETINGS[currentSeason]
    greeting += `\n\n${seasonGreets[Math.floor(Math.random() * seasonGreets.length)]}`
  }

  // 3. 添加天气相关问候
  if (weather && WEATHER_GREETINGS[weather.condition]) {
    const weatherGreets = WEATHER_GREETINGS[weather.condition]
    const selectedGreeting = weatherGreets[Math.floor(Math.random() * weatherGreets.length)]
    greeting += `\n\n${selectedGreeting}`

    // 如果有温度信息，添加温馨提示
    if (weather.temperature !== undefined) {
      if (weather.temperature > 30) {
        greeting += `\n💡 今天气温较高（${weather.temperature}°C），记得多喝水，保持清凉哦！`
      } else if (weather.temperature < 10) {
        greeting += `\n💡 今天气温较低（${weather.temperature}°C），注意保暖，身体健康才能学习好！`
      }
    }
  }

  // 4. 添加诗词（语文学科30%概率，其他学科10%概率）
  const poemProbability = subject === "chinese" ? 0.3 : 0.1
  if (Math.random() < poemProbability) {
    const poem = selectPoem(timeOfDay, weather, subject)
    if (poem) {
      greeting += formatPoem(poem)

      // 如果是语文学科，添加诗词赏析提示
      if (subject === "chinese") {
        greeting += `\n\n✨ 这句诗描绘了${poem.theme}的场景，你能感受到诗人的情感吗？`
      }
    }
  }

  // 5. 添加学科特定问候
  if (subject && SUBJECT_GREETINGS[subject]) {
    const subjectGreets = SUBJECT_GREETINGS[subject]
    greeting += `\n\n${subjectGreets[Math.floor(Math.random() * subjectGreets.length)]}`
  }

  // 6. 添加年级特定建议
  if (grade && GRADE_TIPS[grade]) {
    const tips = GRADE_TIPS[grade]
    greeting += `\n\n💡 **${grade}学习小贴士**\n${tips[Math.floor(Math.random() * tips.length)]}`
  }

  // 7. 添加鼓励语（随机）
  const encouragements = [
    "\n\n🌟 相信自己，你是最棒的！",
    "\n\n💪 每一次努力都会有收获！",
    "\n\n🎯 专注当下，成就未来！",
    "\n\n✨ 学习是一场美妙的旅程！",
    "\n\n🚀 让我们一起向着目标前进！",
  ]

  if (Math.random() < 0.3) {
    greeting += encouragements[Math.floor(Math.random() * encouragements.length)]
  }

  return greeting
}

// 获取天气数据（模拟API调用）
export async function fetchWeatherData(city = "北京"): Promise<WeatherData | null> {
  try {
    // 这里应该调用真实的天气API，例如：
    // const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=YOUR_KEY&q=${city}`)
    // const data = await response.json()

    // 模拟天气数据
    const conditions: WeatherData["condition"][] = ["sunny", "rainy", "cloudy", "snowy", "foggy", "windy"]
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)]

    return {
      condition: randomCondition,
      temperature: Math.floor(Math.random() * 30) + 5, // 5-35度
      description: getWeatherDescription(randomCondition),
    }
  } catch (error) {
    console.error("获取天气数据失败:", error)
    return null
  }
}

// 获取天气描述
function getWeatherDescription(condition: WeatherData["condition"]): string {
  const descriptions: Record<WeatherData["condition"], string> = {
    sunny: "晴朗",
    rainy: "多雨",
    cloudy: "多云",
    snowy: "下雪",
    foggy: "有雾",
    windy: "有风",
  }

  return descriptions[condition] || "未知"
}

// 根据天气和学科生成学习建议
export function generateWeatherBasedStudyTip(weather: WeatherData, subject: string): string {
  const tips: Record<string, Record<string, string>> = {
    sunny: {
      chinese: "☀️ 晴天适合朗读古诗，让诗意与阳光一起绽放！",
      math: "☀️ 阳光明媚，思维也更清晰，解题效率会更高！",
      "math-competition": "☀️ 好天气带来好心情，挑战奥数难题正当时！",
      english: "☀️ Perfect weather for practicing English! Let's speak out loud!",
      science: "☀️ 晴天是观察自然的好机会，学习更生动！",
    },
    rainy: {
      chinese: "🌧️ 雨天静心读书，感受'留得残荷听雨声'的意境！",
      math: "🌧️ 雨声淅沥，正好磨练数学思维的专注力！",
      "math-competition": "🌧️ 雨天室内学习，专心攻克奥数难题！",
      english: "🌧️ Rainy days are great for indoor English practice!",
      science: "🌧️ 观察雨水的形成，这就是科学探究！",
    },
    cloudy: {
      chinese: "☁️ 云天不燥不晒，正适合品味文学之美！",
      math: "☁️ 多云天气很舒适，学习数学不会困倦！",
      "math-competition": "☁️ 云淡风轻，心态平和，解题更顺利！",
      english: "☁️ Cloudy but comfortable, perfect for learning!",
      science: "☁️ 观察云的变化，理解天气现象！",
    },
  }

  return tips[weather.condition]?.[subject] || "无论什么天气，学习的热情都不会改变！"
}

// 生成每日一诗
export function getDailyPoem(): ClassicalPoem {
  const allPoems: ClassicalPoem[] = []

  // 收集所有诗词
  Object.values(CLASSICAL_POEMS).forEach((poems) => {
    allPoems.push(...poems)
  })

  // 根据日期选择（每天同一首诗）
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  const index = dayOfYear % allPoems.length

  return allPoems[index]
}

// 生成学习格言
export function getStudyMotto(): string {
  const mottos = [
    "书山有路勤为径，学海无涯苦作舟。",
    "读书破万卷，下笔如有神。",
    "学而时习之，不亦说乎？",
    "温故而知新，可以为师矣。",
    "三人行，必有我师焉。",
    "敏而好学，不耻下问。",
    "知之者不如好之者，好之者不如乐之者。",
    "学而不思则罔，思而不学则殆。",
    "博学之，审问之，慎思之，明辨之，笃行之。",
    "千里之行，始于足下。",
  ]

  return mottos[Math.floor(Math.random() * mottos.length)]
}
