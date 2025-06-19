"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart3, TrendingUp, Users, FolderOpen, Clock, Target, Activity, Award } from "lucide-react"
import { getCurrentUser, getProjects, getUsers, getReports, getTasks } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function AdminAnalyticsPage() {
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== "admin") {
        router.push("/login")
        return
      }

      setUser(currentUser)
      const [projectsData, usersData, reportsData, tasksData] = await Promise.all([
        getProjects(),
        getUsers(),
        getReports(),
        getTasks(),
      ])

      setProjects(projectsData || [])
      setUsers(usersData || [])
      setReports(reportsData || [])
      setTasks(tasksData || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load analytics data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  // Calculate analytics data
  const totalProjects = projects.length
  const activeProjects = projects.filter((p) => p.status === "active").length
  const completedProjects = projects.filter((p) => p.status === "completed").length
  const totalUsers = users.length
  const totalReports = reports.length
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === "completed").length

  // Project status distribution
  const projectStatusData = [
    { name: "Active", value: projects.filter((p) => p.status === "active").length, color: "#3b82f6" },
    { name: "Completed", value: projects.filter((p) => p.status === "completed").length, color: "#10b981" },
    { name: "Pending", value: projects.filter((p) => p.status === "pending").length, color: "#f59e0b" },
    { name: "Suspended", value: projects.filter((p) => p.status === "suspended").length, color: "#ef4444" },
  ]

  // User role distribution
  const userRoleData = [
    { name: "Admin", value: users.filter((u) => u.role === "admin").length, color: "#dc2626" },
    { name: "Staff", value: users.filter((u) => u.role === "staff").length, color: "#2563eb" },
    { name: "Intern", value: users.filter((u) => u.role === "intern").length, color: "#16a34a" },
  ]

  // Monthly activity data (mock data for demonstration)
  const monthlyActivityData = [
    { month: "Jan", projects: 5, tasks: 45, reports: 12 },
    { month: "Feb", projects: 8, tasks: 52, reports: 18 },
    { month: "Mar", projects: 6, tasks: 38, reports: 15 },
    { month: "Apr", projects: 12, tasks: 67, reports: 22 },
    { month: "May", projects: 9, tasks: 58, reports: 19 },
    { month: "Jun", projects: 15, tasks: 72, reports: 28 },
  ]

  // Project progress data
  const projectProgressData = projects
    .map((p) => ({
      name: p.name.length > 20 ? p.name.substring(0, 20) + "..." : p.name,
      progress: p.progress || 0,
      status: p.status,
    }))
    .slice(0, 10)

  // Task completion rate
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Project completion rate
  const projectCompletionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0

  // Recent activity (mock data)
  const recentActivity = [
    { type: "project", action: "created", item: "New Mobile App", user: "John Doe", time: "2 hours ago" },
    { type: "task", action: "completed", item: "Database Migration", user: "Jane Smith", time: "4 hours ago" },
    { type: "report", action: "submitted", item: "Weekly Progress Report", user: "Mike Johnson", time: "6 hours ago" },
    { type: "project", action: "updated", item: "CloudTrack Development", user: "Sarah Wilson", time: "8 hours ago" },
  ]

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Comprehensive insights into your organization's performance</p>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProjects}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  {activeProjects} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-xs text-muted-foreground">Across all roles</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{taskCompletionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {completedTasks} of {totalTasks} tasks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reports Submitted</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalReports}</div>
                <p className="text-xs text-muted-foreground">Total reports</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
                <CardDescription>Overview of project statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: {
                      label: "Projects",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={projectStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {projectStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Composition</CardTitle>
                <CardDescription>Distribution of team members by role</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: {
                      label: "Users",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userRoleData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {userRoleData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div> */}

          {/* Charts Row 2 */}
          {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Activity Trends</CardTitle>
                <CardDescription>Projects, tasks, and reports over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    projects: {
                      label: "Projects",
                      color: "hsl(var(--chart-1))",
                    },
                    tasks: {
                      label: "Tasks",
                      color: "hsl(var(--chart-2))",
                    },
                    reports: {
                      label: "Reports",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyActivityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="projects"
                        stackId="1"
                        stroke="var(--color-projects)"
                        fill="var(--color-projects)"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="tasks"
                        stackId="1"
                        stroke="var(--color-tasks)"
                        fill="var(--color-tasks)"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="reports"
                        stackId="1"
                        stroke="var(--color-reports)"
                        fill="var(--color-reports)"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Progress Overview</CardTitle>
                <CardDescription>Current progress of active projects</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    progress: {
                      label: "Progress",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectProgressData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" width={120} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="progress" fill="var(--color-progress)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div> */}

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Project Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-3xl font-bold">{projectCompletionRate}%</div>
                  <Progress value={projectCompletionRate} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {completedProjects} of {totalProjects} projects completed
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Task Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-3xl font-bold">{taskCompletionRate}%</div>
                  <Progress value={taskCompletionRate} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {completedTasks} of {totalTasks} tasks completed
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Team Productivity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-3xl font-bold">{totalUsers > 0 ? Math.round(totalTasks / totalUsers) : 0}</div>
                  <p className="text-sm text-muted-foreground">Average tasks per team member</p>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-green-500">+12% from last month</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest actions across your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="flex-shrink-0">
                      {activity.type === "project" && <FolderOpen className="h-5 w-5 text-blue-500" />}
                      {activity.type === "task" && <Target className="h-5 w-5 text-green-500" />}
                      {activity.type === "report" && <BarChart3 className="h-5 w-5 text-purple-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {activity.user} {activity.action} {activity.item}
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
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
