import type { ReactNode } from "react"
import { Inter } from "next/font/google"
import { Metadata } from "next"
import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

// Load Inter font
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

// Metadata for SEO and head tags
export const metadata: Metadata = {
  title: "CloudTrack - Task & Team Management",
  description: "Ultimate task and team management solution for CloudWare Technologies",
  generator: "v0.dev",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
