import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import MainLayout from "@/components/main-layout"
import AnalyticsProvider from "./analytics-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Hoàng Trí - Chuyên sửa xe máy & độ xe",
  description: "Chuyên sửa xe máy & độ xe",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "min-h-screen bg-background antialiased")}>
        <AnalyticsProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </AnalyticsProvider>
      </body>
    </html>
  )
}
