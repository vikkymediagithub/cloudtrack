"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Progress } from "@/components/ui/progress"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Plus, Edit, Trash2, Users, Clock, Target, DollarSign, Eye } from "lucide-react"
import { getCurrentUser, getProjects, getUsers, createProject, updateProject, deleteProject } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function AdminProjectsPage() {
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
    assigned_to: [] as string[],
    deadline: undefined as Date | undefined,
    progress: 0,
    priority: "medium",
    budget: "",
  })
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
      const [projectsData, usersData] = await Promise.all([getProjects(), getUsers()])
      setProjects(projectsData || [])
      setUsers(usersData || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async () => {
    try {
      if (!formData.name.trim()) {
        toast({
          title: "Error",
          description: "Project name is required",
          variant: "destructive",
        })
        return
      }

      await createProject({
        name: formData.name,
        description: formData.description,
        status: formData.status as any,
        created_by: user.id,
        assigned_to: formData.assigned_to,
        deadline: formData.deadline ? format(formData.deadline, "yyyy-MM-dd") : "",
        progress: formData.progress,
        priority: formData.priority as any,
        budget: formData.budget ? Number.parseFloat(formData.budget) : undefined,
      })

      toast({
        title: "Success",
        description: "Project created successfully",
      })

      setIsCreateModalOpen(false)
      resetForm()
      loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      })
    }
  }

  const handleEditProject = async () => {
    try {
      if (!selectedProject || !formData.name.trim()) return

      await updateProject(selectedProject.id, {
        name: formData.name,
        description: formData.description,
        status: formData.status as any,
        assigned_to: formData.assigned_to,
        deadline: formData.deadline ? format(formData.deadline, "yyyy-MM-dd") : "",
        progress: formData.progress,
        priority: formData.priority as any,
        budget: formData.budget ? Number.parseFloat(formData.budget) : undefined,
      })

      toast({
        title: "Success",
        description: "Project updated successfully",
      })

      setIsEditModalOpen(false)
      resetForm()
      loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update project",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return
    }

    try {
      await deleteProject(projectId)
      toast({
        title: "Success",
        description: "Project deleted successfully",
      })
      loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete project",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      status: "active",
      assigned_to: [],
      deadline: undefined,
      progress: 0,
      priority: "medium",
      budget: "",
    })
    setSelectedProject(null)
  }

  const openEditModal = (project: any) => {
    setSelectedProject(project)
    setFormData({
      name: project.name,
      description: project.description || "",
      status: project.status,
      assigned_to: project.assigned_to || [],
      deadline: project.deadline ? new Date(project.deadline) : undefined,
      progress: project.progress || 0,
      priority: project.priority || "medium",
      budget: project.budget?.toString() || "",
    })
    setIsEditModalOpen(true)
  }

  const openViewModal = (project: any) => {
    setSelectedProject(project)
    setIsViewModalOpen(true)
  }

  const getAssignedUsers = (assignedIds: string[]) => {
    return users.filter((user) => assignedIds?.includes(user.id))
  }

  const handleUserAssignment = (userId: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        assigned_to: [...prev.assigned_to, userId],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        assigned_to: prev.assigned_to.filter((id) => id !== userId),
      }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading projects...</p>
        </div>
      </div>
    )
  }

  const staffAndInterns = users.filter((u) => u.role === "staff" || u.role === "intern")

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Project Management</h1>
              <p className="text-muted-foreground">Create and manage all projects with team assignments</p>
            </div>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>Add a new project and assign team members</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Project Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter project name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter project description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData({ ...formData, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget ($)</Label>
                      <Input
                        id="budget"
                        type="number"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        placeholder="Enter budget"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="progress">Progress (%)</Label>
                      <Input
                        id="progress"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.progress}
                        onChange={(e) => setFormData({ ...formData, progress: Number.parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Deadline</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.deadline ? format(formData.deadline, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.deadline}
                          onSelect={(date) => setFormData({ ...formData, deadline: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Assign Team Members</Label>
                    <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                      <div className="space-y-3">
                        {staffAndInterns.map((teamUser) => (
                          <div key={teamUser.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={teamUser.id}
                              checked={formData.assigned_to.includes(teamUser.id)}
                              onCheckedChange={(checked) => handleUserAssignment(teamUser.id, checked as boolean)}
                            />
                            <Label htmlFor={teamUser.id} className="flex items-center gap-2 cursor-pointer">
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {teamUser.first_name} {teamUser.last_name}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {teamUser.role} • {teamUser.email}
                                </span>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Selected: {formData.assigned_to.length} team member(s)
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateProject}>Create Project</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Projects</p>
                    <p className="text-2xl font-bold">{projects.length}</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Projects</p>
                    <p className="text-2xl font-bold">{projects.filter((p) => p.status === "active").length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">{projects.filter((p) => p.status === "completed").length}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Budget</p>
                    <p className="text-2xl font-bold">
                      ${projects.reduce((sum, p) => sum + (p.budget || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-2">
                        {project.name}
                        <Badge variant={project.status === "active" ? "default" : "secondary"}>{project.status}</Badge>
                        <Badge
                          variant={
                            project.priority === "high"
                              ? "destructive"
                              : project.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {project.priority}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mb-3">{project.description}</CardDescription>

                      {/* Assigned Team Members */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {getAssignedUsers(project.assigned_to || []).map((assignedUser) => (
                          <Badge key={assignedUser.id} variant="outline" className="text-xs">
                            {assignedUser.first_name} {assignedUser.last_name} ({assignedUser.role})
                          </Badge>
                        ))}
                        {(!project.assigned_to || project.assigned_to.length === 0) && (
                          <span className="text-sm text-muted-foreground">No team members assigned</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openViewModal(project)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditModal(project)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteProject(project.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress: {project.progress}%</span>
                      <span>Deadline: {project.deadline || "No deadline"}</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {project.assigned_to?.length || 0} assigned
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Created {new Date(project.created_at).toLocaleDateString()}
                      </div>
                      {project.budget && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />${project.budget.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {projects.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first project to get started</p>
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* View Project Modal */}
          <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Project Details</DialogTitle>
                <DialogDescription>View complete project information</DialogDescription>
              </DialogHeader>
              {selectedProject && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Project Name</Label>
                      <p className="text-sm">{selectedProject.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge variant={selectedProject.status === "active" ? "default" : "secondary"}>
                        {selectedProject.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm">{selectedProject.description || "No description"}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Priority</Label>
                      <Badge variant={selectedProject.priority === "high" ? "destructive" : "default"}>
                        {selectedProject.priority}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Progress</Label>
                      <p className="text-sm">{selectedProject.progress}%</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Budget</Label>
                      <p className="text-sm">${selectedProject.budget?.toLocaleString() || "Not set"}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Assigned Team Members</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {getAssignedUsers(selectedProject.assigned_to || []).map((user) => (
                        <Badge key={user.id} variant="outline">
                          {user.first_name} {user.last_name} ({user.role})
                        </Badge>
                      ))}
                      {(!selectedProject.assigned_to || selectedProject.assigned_to.length === 0) && (
                        <span className="text-sm text-muted-foreground">No team members assigned</span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Deadline</Label>
                      <p className="text-sm">{selectedProject.deadline || "No deadline set"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Created</Label>
                      <p className="text-sm">{new Date(selectedProject.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Modal - Similar to Create but with pre-filled data */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Project</DialogTitle>
                <DialogDescription>Update project details and team assignments</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Project Name *</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-budget">Budget ($)</Label>
                    <Input
                      id="edit-budget"
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-progress">Progress (%)</Label>
                    <Input
                      id="edit-progress"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={(e) => setFormData({ ...formData, progress: Number.parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Deadline</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.deadline ? format(formData.deadline, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.deadline}
                        onSelect={(date) => setFormData({ ...formData, deadline: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Assign Team Members</Label>
                  <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                    <div className="space-y-3">
                      {staffAndInterns.map((teamUser) => (
                        <div key={teamUser.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-${teamUser.id}`}
                            checked={formData.assigned_to.includes(teamUser.id)}
                            onCheckedChange={(checked) => handleUserAssignment(teamUser.id, checked as boolean)}
                          />
                          <Label htmlFor={`edit-${teamUser.id}`} className="flex items-center gap-2 cursor-pointer">
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {teamUser.first_name} {teamUser.last_name}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {teamUser.role} • {teamUser.email}
                              </span>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Selected: {formData.assigned_to.length} team member(s)
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditProject}>Update Project</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
