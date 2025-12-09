"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Theme = "dark" | "light" | "eye-care"

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark")

  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as Theme) || "dark"
    setTheme(savedTheme)
    applyTheme(savedTheme)
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement

    // 移除所有主题类
    root.classList.remove("dark", "light", "eye-care")

    // 应用新主题
    root.classList.add(newTheme)

    // 应用护眼模式特殊颜色
    if (newTheme === "eye-care") {
      root.style.setProperty("--background", "45 20% 95%")
      root.style.setProperty("--foreground", "25 40% 20%")
      root.style.setProperty("--primary", "35 60% 50%")
      root.style.setProperty("--accent", "40 50% 85%")
    } else {
      // 重置自定义属性
      root.style.removeProperty("--background")
      root.style.removeProperty("--foreground")
      root.style.removeProperty("--primary")
      root.style.removeProperty("--accent")
    }

    localStorage.setItem("theme", newTheme)
  }

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  const themeIcons = {
    dark: <Moon className="h-5 w-5" />,
    light: <Sun className="h-5 w-5" />,
    "eye-care": <Eye className="h-5 w-5" />,
  }

  const themeNames = {
    dark: "深色模式",
    light: "浅色模式",
    "eye-care": "护眼模式",
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-full transition-all duration-300"
        >
          {themeIcons[theme]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-slate-800/95 backdrop-blur-sm border-slate-700/50">
        <DropdownMenuItem
          onClick={() => handleThemeChange("dark")}
          className="text-slate-200 hover:bg-slate-700/50 cursor-pointer"
        >
          <Moon className="h-4 w-4 mr-2" />
          深色模式
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange("light")}
          className="text-slate-200 hover:bg-slate-700/50 cursor-pointer"
        >
          <Sun className="h-4 w-4 mr-2" />
          浅色模式
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange("eye-care")}
          className="text-slate-200 hover:bg-slate-700/50 cursor-pointer"
        >
          <Eye className="h-4 w-4 mr-2" />
          护眼模式
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
