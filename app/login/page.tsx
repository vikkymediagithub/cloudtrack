"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"
import { Cloud, ArrowLeft, AlertCircle } from "lucide-react"
import { signIn, getCurrentUser } from "@/lib/supabase"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.email || !formData.password) {
      setError("Please enter both email and password.")
      return
    }

    setIsLoading(true)

    try {
      console.log("Attempting to sign in with:", formData.email)

      // Sign in the user
      const authResult = await signIn(formData.email, formData.password)
      console.log("Auth result:", authResult)

      if (!authResult.user) {
        throw new Error("Login failed - no user returned")
      }

      // Get user data
      const user = await getCurrentUser()
      console.log("User data:", user)

      if (!user) {
        throw new Error("Failed to get user data after login")
      }

      toast({
        title: `✅ Welcome back, ${user.first_name}!`,
        description: "You have successfully logged in to CloudTrack.",
      })

      // Redirect based on role
      console.log("Redirecting to:", `/dashboard/${user.role}`)
      router.push(`/dashboard/${user.role}`)
    } catch (error: any) {
      console.error("Login error:", error)
      const errorMessage = error.message || "Invalid email or password. Please try again."
      setError(errorMessage)
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Cloud className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">CloudTrack</span>
            </div>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to your CloudTrack account</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </div>

            {/* Demo credentials for testing */}
            {/* <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                Demo: Create an account first, then use those credentials to login
              </p>
            </div> */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
