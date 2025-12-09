"use client"

import { useState, useEffect } from "react"
import type { WeatherData } from "@/lib/greeting-generator"

const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || ""
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather"

export function useWeather(city = "北京") {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true)
      setError(null)

      try {
        if (WEATHER_API_KEY) {
          const response = await fetch(`${WEATHER_API_URL}?q=${city}&appid=${WEATHER_API_KEY}&units=metric&lang=zh_cn`)

          if (!response.ok) {
            throw new Error("天气API请求失败")
          }

          const data = await response.json()

          const weatherConditionMap: Record<string, WeatherData["condition"]> = {
            Clear: "sunny",
            Clouds: "cloudy",
            Rain: "rainy",
            Drizzle: "rainy",
            Snow: "snowy",
            Mist: "foggy",
            Fog: "foggy",
            Haze: "foggy",
            Dust: "windy",
            Smoke: "foggy",
          }

          const condition = weatherConditionMap[data.weather[0].main] || "cloudy"

          setWeather({
            condition,
            temperature: Math.round(data.main.temp),
            description: data.weather[0].description,
          })
        } else {
          const mockWeather = generateMockWeather()
          setWeather(mockWeather)
        }
      } catch (err) {
        console.error("获取天气失败:", err)
        setError(err instanceof Error ? err.message : "未知错误")

        const mockWeather = generateMockWeather()
        setWeather(mockWeather)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
    const interval = setInterval(fetchWeather, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [city])

  return { weather, loading, error }
}

function generateMockWeather(): WeatherData {
  const conditions: WeatherData["condition"][] = ["sunny", "cloudy", "rainy", "snowy", "foggy", "windy"]
  const condition = conditions[Math.floor(Math.random() * conditions.length)]

  const tempRanges: Record<WeatherData["condition"], [number, number]> = {
    sunny: [20, 32],
    cloudy: [15, 25],
    rainy: [12, 22],
    snowy: [-5, 5],
    foggy: [10, 20],
    windy: [8, 18],
  }

  const [min, max] = tempRanges[condition]
  const temperature = Math.floor(Math.random() * (max - min + 1)) + min

  const descriptions: Record<WeatherData["condition"], string> = {
    sunny: "晴朗",
    cloudy: "多云",
    rainy: "小雨",
    snowy: "小雪",
    foggy: "雾",
    windy: "大风",
  }

  return {
    condition,
    temperature,
    description: descriptions[condition],
  }
}
