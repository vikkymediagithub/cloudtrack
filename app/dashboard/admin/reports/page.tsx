"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { subDays, startOfWeek, startOfMonth } from "date-fns"
import { CalendarIcon, Download, FileText, Filter, Eye, Plus, BarChart3, TrendingUp, Users } from "lucide-react"
import { getCurrentUser, getReports, getProjects, getUsers, createReport, updateReport } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function AdminReportsPage() {
  const [user, setUser] = useState<any>(null)
  const [reports, setReports] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredReports, setFilteredReports] = useState<any[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [filters, setFilters] = useState({
    period: "all",
    type: "all",
    status: "all",
    user: "all",
    project: "all",
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
  })
  const [formData, setFormData] = useState({
    project_id: "",
    content: "",
    type: "weekly",
    status: "draft",
  })
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [reports, filters])

  const loadData = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== "admin") {
        router.push("/login")
        return
      }

      setUser(currentUser)
      const [reportsData, projectsData, usersData] = await Promise.all([getReports(), getProjects(), getUsers()])
      setReports(reportsData || [])
      setProjects(projectsData || [])
      setUsers(usersData || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load reports data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...reports]

    // Filter by period
    if (filters.period !== "all") {
      const now = new Date()
      let startDate: Date

      switch (filters.period) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case "week":
          startDate = startOfWeek(now)
          break
        case "month":
          startDate = startOfMonth(now)
          break
        case "last7days":
          startDate = subDays(now, 7)
          break
        case "last30days":
          startDate = subDays(now, 30)
          break
        default:
          startDate = new Date(0)
      }

      filtered = filtered.filter((report) => new Date(report.created_at) >= startDate)
    }

    // Filter by custom date range
    if (filters.dateFrom) {
      filtered = filtered.filter((report) => new Date(report.created_at) >= filters.dateFrom!)
    }
    if (filters.dateTo) {
      filtered = filtered.filter((report) => new Date(report.created_at) <= filters.dateTo!)
    }

    // Filter by type
    if (filters.type !== "all") {
      filtered = filtered.filter((report) => report.type === filters.type)
    }

    // Filter by status
    if (filters.status !== "all") {
      filtered = filtered.filter((report) => report.status === filters.status)
    }

    // Filter by user
    if (filters.user !== "all") {
      filtered = filtered.filter((report) => report.submitted_by === filters.user)
    }

    // Filter by project
    if (filters.project !== "all") {
      filtered = filtered.filter((report) => report.project_id === filters.project)
    }

    setFilteredReports(filtered)
  }

  const handleCreateReport = async () => {
    try {
      if (!formData.project_id || !formData.content.trim()) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      await createReport({
        project_id: formData.project_id,
        submitted_by: user.id,
        content: formData.content,
        type: formData.type as any,
        status: formData.status as any,
      })

      toast({
        title: "Success",
        description: "Report created successfully",
      })

      setIsCreateModalOpen(false)
      resetForm()
      loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create report",
        variant: "destructive",
      })
    }
  }

  const handleUpdateReportStatus = async (reportId: string, newStatus: string) => {
    try {
      await updateReport(reportId, { status: newStatus as any })
      toast({
        title: "Success",
        description: "Report status updated successfully",
      })
      loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update report status",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      project_id: "",
      content: "",
      type: "weekly",
      status: "draft",
    })
  }

  const downloadReports = () => {
    try {
      const csvData = [
        ["Report ID", "Project", "Submitted By", "Type", "Status", "Created Date", "Content Preview"],
        ...filteredReports.map((report) => [
          report.id,
          report.project?.name || "Unknown Project",
          report.submitted_by_user
            ? `${report.submitted_by_user.first_name} ${report.submitted_by_user.last_name}`
            : "Unknown User",
          report.type,
          report.status,
          new Date(report.created_at).toLocaleDateString(),
          report.content.substring(0, 100) + (report.content.length > 100 ? "..." : ""),
        ]),
      ]

      const csvContent = csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `reports-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Reports downloaded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download reports",
        variant: "destructive",
      })
    }
  }

  const getReportStats = () => {
    const total = filteredReports.length
    const submitted = filteredReports.filter((r) => r.status === "submitted").length
    const reviewed = filteredReports.filter((r) => r.status === "reviewed").length
    const draft = filteredReports.filter((r) => r.status === "draft").length

    return { total, submitted, reviewed, draft }
  }

  const openViewModal = (report: any) => {
    setSelectedReport(report)
    setIsViewModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading reports...</p>
        </div>
      </div>
    )
  }

  const stats = getReportStats()

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Reports Management</h1>
              <p className="text-muted-foreground">View and manage all project reports</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={downloadReports} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Reports
              </Button>
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Report</DialogTitle>
                    <DialogDescription>Create a new project report</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="project">Project *</Label>
                        <Select
                          value={formData.project_id}
                          onValueChange={(value) => setFormData({ ...formData, project_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                          <SelectContent>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Report Type</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) => setFormData({ ...formData, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="milestone">Milestone</SelectItem>
                            <SelectItem value="final">Final</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content">Report Content *</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Enter report content..."
                        rows={8}
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
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="submitted">Submitted</SelectItem>
                          <SelectItem value="reviewed">Reviewed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateReport}>Create Report</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Reports</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p className="text-2xl font-bold">{stats.submitted}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Reviewed</p>
                    <p className="text-2xl font-bold">{stats.reviewed}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Draft</p>
                    <p className="text-2xl font-bold">{stats.draft}</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <Label>Period</Label>
                  <Select value={filters.period} onValueChange={(value) => setFilters({ ...filters, period: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="last7days">Last 7 Days</SelectItem>
                      <SelectItem value="last30days">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="milestone">Milestone</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>User</Label>
                  <Select value={filters.user} onValueChange={(value) => setFilters({ ...filters, user: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.first_name} {user.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select value={filters.project} onValueChange={(value) => setFilters({ ...filters, project: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Custom Date Range</Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.dateFrom}
                          onSelect={(date) => setFilters({ ...filters, dateFrom: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.dateTo}
                          onSelect={(date) => setFilters({ ...filters, dateTo: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <div className="grid gap-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5" />
                        {report.project?.name || "Unknown Project"}
                        <Badge variant={report.type === "final" ? "default" : "secondary"}>{report.type}</Badge>
                        <Badge
                          variant={
                            report.status === "reviewed"
                              ? "default"
                              : report.status === "submitted"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {report.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Submitted by {report.submitted_by_user?.first_name} {report.submitted_by_user?.last_name} on{" "}
                        {new Date(report.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openViewModal(report)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {report.status === "submitted" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateReportStatus(report.id, "reviewed")}
                        >
                          Mark Reviewed
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">{report.content}</p>
                </CardContent>
              </Card>
            ))}

            {filteredReports.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No reports found</h3>
                  <p className="text-muted-foreground mb-4">
                    {reports.length === 0 ? "No reports have been created yet" : "Try adjusting your filters"}
                  </p>
                  {reports.length === 0 && (
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Report
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* View Report Modal */}
          <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Report Details</DialogTitle>
                <DialogDescription>View complete report information</DialogDescription>
              </DialogHeader>
              {selectedReport && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Project</Label>
                      <p className="text-sm">{selectedReport.project?.name || "Unknown Project"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Submitted By</Label>
                      <p className="text-sm">
                        {selectedReport.submitted_by_user?.first_name} {selectedReport.submitted_by_user?.last_name}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Type</Label>
                      <Badge variant={selectedReport.type === "final" ? "default" : "secondary"}>
                        {selectedReport.type}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge
                        variant={
                          selectedReport.status === "reviewed"
                            ? "default"
                            : selectedReport.status === "submitted"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {selectedReport.status}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Created</Label>
                      <p className="text-sm">{new Date(selectedReport.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Report Content</Label>
                    <div className="mt-2 p-4 bg-muted rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{selectedReport.content}</p>
                    </div>
                  </div>
                  {selectedReport.status === "submitted" && (
                    <div className="flex justify-end">
                      <Button onClick={() => handleUpdateReportStatus(selectedReport.id, "reviewed")}>
                        Mark as Reviewed
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
