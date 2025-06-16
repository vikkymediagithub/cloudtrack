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
import { Plus, Edit, Trash2, Eye, Search, StickyNote, Globe, Users, Lock } from "lucide-react"
import { getCurrentUser, getNotes, getProjects, createNote, updateNote, deleteNote } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function AdminNotesPage() {
  const [user, setUser] = useState<any>(null)
  const [notes, setNotes] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredNotes, setFilteredNotes] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<any>(null)
  const [filters, setFilters] = useState({
    project: "all",
    visibility: "all",
  })
  const [formData, setFormData] = useState({
    project_id: "",
    title: "",
    content: "",
    visibility: "team",
  })
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [notes, searchTerm, filters])

  const loadData = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== "admin") {
        router.push("/login")
        return
      }

      setUser(currentUser)
      const [notesData, projectsData] = await Promise.all([getNotes(), getProjects()])
      setNotes(notesData || [])
      setProjects(projectsData || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load notes data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...notes]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Project filter
    if (filters.project !== "all") {
      filtered = filtered.filter((note) => note.project_id === filters.project)
    }

    // Visibility filter
    if (filters.visibility !== "all") {
      filtered = filtered.filter((note) => note.visibility === filters.visibility)
    }

    setFilteredNotes(filtered)
  }

  const handleCreateNote = async () => {
    try {
      if (!formData.title.trim() || !formData.content.trim()) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      await createNote({
        project_id: formData.project_id || null,
        created_by: user.id,
        title: formData.title,
        content: formData.content,
        visibility: formData.visibility as any,
      })

      toast({
        title: "Success",
        description: "Note created successfully",
      })

      setIsCreateModalOpen(false)
      resetForm()
      loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create note",
        variant: "destructive",
      })
    }
  }

  const handleEditNote = async () => {
    try {
      if (!selectedNote || !formData.title.trim() || !formData.content.trim()) return

      await updateNote(selectedNote.id, {
        project_id: formData.project_id || null,
        title: formData.title,
        content: formData.content,
        visibility: formData.visibility as any,
      })

      toast({
        title: "Success",
        description: "Note updated successfully",
      })

      setIsEditModalOpen(false)
      resetForm()
      loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update note",
        variant: "destructive",
      })
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
      return
    }

    try {
      await deleteNote(noteId)
      toast({
        title: "Success",
        description: "Note deleted successfully",
      })
      loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete note",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      project_id: "",
      title: "",
      content: "",
      visibility: "team",
    })
    setSelectedNote(null)
  }

  const openEditModal = (note: any) => {
    setSelectedNote(note)
    setFormData({
      project_id: note.project_id || "",
      title: note.title,
      content: note.content,
      visibility: note.visibility,
    })
    setIsEditModalOpen(true)
  }

  const openViewModal = (note: any) => {
    setSelectedNote(note)
    setIsViewModalOpen(true)
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "public":
        return <Globe className="h-4 w-4" />
      case "team":
        return <Users className="h-4 w-4" />
      case "private":
        return <Lock className="h-4 w-4" />
      default:
        return <StickyNote className="h-4 w-4" />
    }
  }

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case "public":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
      case "team":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
      case "private":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading notes...</p>
        </div>
      </div>
    )
  }

  const noteStats = {
    total: notes.length,
    public: notes.filter((n) => n.visibility === "public").length,
    team: notes.filter((n) => n.visibility === "team").length,
    private: notes.filter((n) => n.visibility === "private").length,
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Notes Management</h1>
              <p className="text-muted-foreground">Create and manage project notes and documentation</p>
            </div>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Note
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Note</DialogTitle>
                  <DialogDescription>Add a new note or documentation</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter note title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="visibility">Visibility</Label>
                      <Select
                        value={formData.visibility}
                        onValueChange={(value) => setFormData({ ...formData, visibility: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="team">Team</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project">Project (Optional)</Label>
                    <Select
                      value={formData.project_id}
                      onValueChange={(value) => setFormData({ ...formData, project_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Project</SelectItem>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Enter note content..."
                      rows={8}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateNote}>Create Note</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Notes</p>
                    <p className="text-2xl font-bold">{noteStats.total}</p>
                  </div>
                  <StickyNote className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Public</p>
                    <p className="text-2xl font-bold">{noteStats.public}</p>
                  </div>
                  <Globe className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Team</p>
                    <p className="text-2xl font-bold">{noteStats.team}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Private</p>
                    <p className="text-2xl font-bold">{noteStats.private}</p>
                  </div>
                  <Lock className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search notes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={filters.project} onValueChange={(value) => setFilters({ ...filters, project: value })}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by project" />
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
                  <Select
                    value={filters.visibility}
                    onValueChange={(value) => setFilters({ ...filters, visibility: value })}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Visibility</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 line-clamp-2">{note.title}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getVisibilityColor(note.visibility)}>
                          <div className="flex items-center gap-1">
                            {getVisibilityIcon(note.visibility)}
                            {note.visibility}
                          </div>
                        </Badge>
                        {note.project && (
                          <Badge variant="outline" className="text-xs">
                            {note.project.name}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs">
                        By {note.created_by_user?.first_name} {note.created_by_user?.last_name} •{" "}
                        {new Date(note.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openViewModal(note)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(note)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteNote(note.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">{note.content}</p>
                </CardContent>
              </Card>
            ))}

            {filteredNotes.length === 0 && (
              <div className="col-span-full">
                <Card>
                  <CardContent className="text-center py-12">
                    <StickyNote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No notes found</h3>
                    <p className="text-muted-foreground mb-4">
                      {notes.length === 0
                        ? "Create your first note to get started"
                        : "Try adjusting your search or filters"}
                    </p>
                    {notes.length === 0 && (
                      <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Note
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* View Note Modal */}
          <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Note Details</DialogTitle>
                <DialogDescription>View complete note information</DialogDescription>
              </DialogHeader>
              {selectedNote && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Title</Label>
                      <p className="text-sm font-semibold">{selectedNote.title}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Visibility</Label>
                      <Badge className={getVisibilityColor(selectedNote.visibility)}>
                        <div className="flex items-center gap-1">
                          {getVisibilityIcon(selectedNote.visibility)}
                          {selectedNote.visibility}
                        </div>
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Project</Label>
                      <p className="text-sm">{selectedNote.project?.name || "No project assigned"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Created By</Label>
                      <p className="text-sm">
                        {selectedNote.created_by_user?.first_name} {selectedNote.created_by_user?.last_name}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created Date</Label>
                    <p className="text-sm">{new Date(selectedNote.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Content</Label>
                    <div className="mt-2 p-4 bg-muted rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">{selectedNote.content}</p>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Note Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Note</DialogTitle>
                <DialogDescription>Update note information</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title *</Label>
                    <Input
                      id="edit-title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-visibility">Visibility</Label>
                    <Select
                      value={formData.visibility}
                      onValueChange={(value) => setFormData({ ...formData, visibility: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-project">Project (Optional)</Label>
                  <Select
                    value={formData.project_id}
                    onValueChange={(value) => setFormData({ ...formData, project_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Project</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-content">Content *</Label>
                  <Textarea
                    id="edit-content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditNote}>Update Note</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
