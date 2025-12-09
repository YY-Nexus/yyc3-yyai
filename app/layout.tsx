import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Mr. Zhou AI Intelligent Center",
  description: "言启智云丨语枢万象 - 中国教育2023-2025年小学、初中多学科全智能AI智能体",
  generator: "Mr. Zhou AI",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
