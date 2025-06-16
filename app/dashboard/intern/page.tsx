"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Progress } from "@/components/ui/progress"
import { FolderOpen, CheckCircle, Clock } from "lucide-react"
import { getCurrentUser, getProjects } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function InternDashboard() {
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push("/login")
          return
        }

        if (currentUser.role !== "intern") {
          router.push(`/dashboard/${currentUser.role}`)
          return
        }

        setUser(currentUser)

        const projectsData = await getProjects()

        // Filter projects assigned to this intern
        const myProjects = projectsData?.filter((p) => p.assigned_to?.includes(currentUser.id)) || []

        setProjects(myProjects)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const announcements = [
    { id: 1, title: "Team Meeting Tomorrow", content: "Weekly standup at 10 AM", priority: "high" },
    { id: 2, title: "New Project Guidelines", content: "Updated coding standards available", priority: "medium" },
    { id: 3, title: "Office Hours Extended", content: "Library access until 8 PM", priority: "low" },
  ]

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Welcome back, {user.first_name}!</h1>
            <p className="text-muted-foreground">Here's what's happening with your projects today.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assigned Projects</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects.length}</div>
                <p className="text-xs text-muted-foreground">
                  {projects.filter((p) => p.status === "active").length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects.filter((p) => p.progress === 100).length}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {projects.filter((p) => p.deadline && new Date(p.deadline) > new Date()).length}
                </div>
                <p className="text-xs text-muted-foreground">Next 2 weeks</p>
              </CardContent>
            </Card>
          </div>

          {/* My Projects */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>My Projects</CardTitle>
              <CardDescription>Projects assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {projects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <Badge variant="outline">Due: {project.deadline || "No deadline"}</Badge>
                      </div>
                      <CardDescription>{project.description || "No description available"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Overall Progress</span>
                            <span className="text-sm text-muted-foreground">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Update Progress
                          </Button>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {projects.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No projects assigned yet. Contact your supervisor to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
              <CardDescription>Important updates and announcements from your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`p-4 rounded-lg border ${
                      announcement.priority === "high"
                        ? "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                        : announcement.priority === "medium"
                          ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800"
                          : "bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{announcement.title}</h4>
                      <Badge
                        variant={
                          announcement.priority === "high"
                            ? "destructive"
                            : announcement.priority === "medium"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {announcement.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{announcement.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
