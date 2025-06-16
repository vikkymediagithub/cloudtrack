"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Progress } from "@/components/ui/progress"
import { FolderOpen, Users, Activity } from "lucide-react"
import { getCurrentUser, getProjects, getUsers } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function StaffDashboard() {
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [interns, setInterns] = useState<any[]>([])
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

        if (currentUser.role !== "staff") {
          router.push(`/dashboard/${currentUser.role}`)
          return
        }

        setUser(currentUser)

        const [projectsData, usersData] = await Promise.all([getProjects(), getUsers()])

        // Filter projects assigned to this staff member
        const myProjects =
          projectsData?.filter((p) => p.assigned_to?.includes(currentUser.id) || p.created_by === currentUser.id) || []

        // Filter interns
        const internUsers = usersData?.filter((u) => u.role === "intern") || []

        setProjects(myProjects)
        setInterns(internUsers)
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

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Staff Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user.first_name}!</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">My Projects</CardTitle>
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
                <CardTitle className="text-sm font-medium">Available Interns</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{interns.length}</div>
                <p className="text-xs text-muted-foreground">Team members</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects.filter((p) => p.progress === 100).length}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* My Projects */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>My Projects</CardTitle>
              <CardDescription>Projects you're currently working on</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{project.name}</h4>
                      <Badge variant={project.status === "active" ? "default" : "secondary"}>{project.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {project.description || "No description available"}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <span>Progress: {project.progress}%</span>
                      <span>Due: {project.deadline || "No deadline"}</span>
                    </div>
                    <Progress value={project.progress} className="h-2 mb-3" />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Update Status
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No projects assigned yet. Contact your admin to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Available Interns */}
          <Card>
            <CardHeader>
              <CardTitle>Available Interns</CardTitle>
              <CardDescription>Interns you can assign to projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interns.map((intern) => (
                  <div key={intern.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">
                        {intern.first_name} {intern.last_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">{intern.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={intern.status === "active" ? "default" : "secondary"}>{intern.status}</Badge>
                      <Button variant="outline" size="sm">
                        Assign Task
                      </Button>
                    </div>
                  </div>
                ))}
                {interns.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No interns available at the moment.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
