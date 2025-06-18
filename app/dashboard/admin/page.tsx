"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Users, FolderOpen, FileText, Download, Plus, Activity, TrendingUp, AlertCircle } from "lucide-react"
import { getCurrentUser, getProjects, getUsers, getReports } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

const activityData = [
  { name: "Mon", tasks: 12, projects: 3 },
  { name: "Tue", tasks: 19, projects: 5 },
  { name: "Wed", tasks: 15, projects: 4 },
  { name: "Thu", tasks: 22, projects: 6 },
  { name: "Fri", tasks: 18, projects: 4 },
  { name: "Sat", tasks: 8, projects: 2 },
  { name: "Sun", tasks: 5, projects: 1 },
]

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      try {
        setError("")
        console.log("Loading admin dashboard data...")

        const currentUser = await getCurrentUser()
        console.log("Current user:", currentUser)

        if (!currentUser) {
          console.log("No user found, redirecting to login")
          router.push("/login")
          return
        }

        if (currentUser.role !== "admin") {
          console.log("User is not admin, redirecting to their dashboard")
          router.push(`/dashboard/${currentUser.role}`)
          return
        }

        setUser(currentUser)

        // Load data with error handling for each
        try {
          const projectsData = await getProjects()
          setProjects(projectsData || [])
          console.log("Projects loaded:", projectsData?.length || 0)
        } catch (err) {
          console.error("Error loading projects:", err)
          setProjects([])
        }

        try {
          const usersData = await getUsers()
          setUsers(usersData || [])
          console.log("Users loaded:", usersData?.length || 0)
        } catch (err) {
          console.error("Error loading users:", err)
          setUsers([])
        }

        try {
          const reportsData = await getReports()
          setReports(reportsData || [])
          console.log("Reports loaded:", reportsData?.length || 0)
        } catch (err) {
          console.error("Error loading reports:", err)
          setReports([])
        }
      } catch (error: any) {
        console.error("Dashboard load error:", error)
        setError(error.message || "Failed to load dashboard data")
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

  const handleDownloadReport = () => {
    try {
      // Generate CSV report
      const csvData = [
        ["Project Name", "Status", "Progress", "Created By", "Deadline"],
        ...projects.map((p) => [
          p.name,
          p.status,
          `${p.progress}%`,
          p.created_by_user ? `${p.created_by_user.first_name} ${p.created_by_user.last_name}` : "Unknown",
          p.deadline || "No deadline",
        ]),
      ]

      const csvContent = csvData.map((row) => row.join(",")).join("\n")
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `cloudtrack-report-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Report Downloaded",
        description: "Your comprehensive report has been downloaded successfully.",
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    }
  }

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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need to be logged in to access this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/login">Go to Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const teamComposition = users.reduce((acc, user) => {
    const role = user.role.charAt(0).toUpperCase() + user.role.slice(1)
    const existing = acc.find((item: { role: any }) => item.role === role)
    if (existing) {
      existing.count++
    } else {
      acc.push({ role, count: 1 })
    }
    return acc
  }, [] as any[])

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <div className="p-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Welcome back, {user.first_name}!</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {/* router-to-project */}
              <Button onClick={() => router.push(`/dashboard/${user.role}/projects`)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
              <Button variant="outline" onClick={handleDownloadReport} className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-md rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects.length}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  {projects.filter((p) => p.status === "active").length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">
                  {users.filter((u) => u.role === "admin").length} Admin,{" "}
                  {users.filter((u) => u.role === "staff").length} Staff,{" "}
                  {users.filter((u) => u.role === "intern").length} Intern
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {projects.reduce((sum, p) => sum + (p.progress < 100 ? 1 : 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reports Submitted</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reports.length}</div>
                <p className="text-xs text-muted-foreground">Total reports</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Activity Overview */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Activity Overview</CardTitle>
                <CardDescription>Weekly tasks and projects activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[320px]">
                    <ChartContainer
                      config={{
                        tasks: {
                          label: "Tasks",
                          color: "hsl(var(--chart-1))",
                        },
                        projects: {
                          label: "Projects",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={activityData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Bar dataKey="tasks" fill="hsl(var(--chart-1))" />
                          <Bar dataKey="projects" fill="hsl(var(--chart-2))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Composition */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Team Composition</CardTitle>
                <CardDescription>Distribution of team members by role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[320px]">
                    <ChartContainer
                      config={{
                        count: {
                          label: "Count",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={teamComposition}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="role" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" fill="var(--color-count)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>



          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Latest projects in your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{project.name}</h4>
                      <p className="text-sm text-muted-foreground">{project.description || "No description"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={project.status === "active" ? "default" : "secondary"}>{project.status}</Badge>
                      <span className="text-sm text-muted-foreground">{project.progress}%</span>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No projects found. Create your first project to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
