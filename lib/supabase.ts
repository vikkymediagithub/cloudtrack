import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


// Database Types
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: "admin" | "staff" | "intern"
  status: "active" | "suspended" | "disabled"
  avatar_url?: string
  phone?: string
  department?: string
  bio?: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description: string
  status: "active" | "pending" | "completed" | "suspended"
  created_by: string
  assigned_to: string[]
  deadline: string
  progress: number
  priority: "low" | "medium" | "high"
  budget?: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string
  assigned_to: string
  status: "pending" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  due_date: string
  created_at: string
  updated_at: string
}

export interface Report {
  id: string
  project_id: string
  submitted_by: string
  content: string
  type: "weekly" | "milestone" | "final"
  status: "draft" | "submitted" | "reviewed"
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  project_id: string
  created_by: string
  title: string
  content: string
  visibility: "public" | "team" | "private"
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  created_at: string
}

// Auth functions
export const signUp = async (
  email: string,
  password: string,
  userData: {
    first_name: string
    last_name: string
    role: string
  },
) => {
  try {
    console.log("Starting signup process for:", email)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
        },
      },
    })

    if (authError) {
      console.error("Auth signup error:", authError)
      throw new Error(authError.message || "Failed to create account")
    }

    if (!authData.user) {
      throw new Error("User creation failed - no user returned")
    }

    console.log("Auth user created:", authData.user.id)

    if (!authData.user.email_confirmed_at && !authData.session) {
      console.log("Email confirmation required")
      return {
        ...authData,
        needsConfirmation: true,
        message: "Please check your email and click the confirmation link to complete registration.",
      }
    }

    try {
      console.log("Inserting user data into users table...")
      const { error: insertError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: authData.user.email!,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role as any,
        status: "active",
      })

      if (insertError) {
        console.error("User table insert error:", insertError)
        console.log("Will create user data on first login")
      } else {
        console.log("User data inserted successfully")
      }
    } catch (insertErr) {
      console.error("Insert operation failed:", insertErr)
    }

    return authData
  } catch (error: any) {
    console.error("SignUp error:", error)
    throw new Error(error.message || "Registration failed. Please try again.")
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("SignIn error:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("SignIn error:", error)
    throw error
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("SignOut error:", error)
      throw error
    }
  } catch (error) {
    console.error("SignOut error:", error)
    throw error
  }
}

export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error("Get auth user error:", authError)
      throw authError
    }

    if (!user) {
      return null
    }

    // Try to get user data from our users table - fix the multiple rows issue
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle() // Use maybeSingle instead of single to handle no rows gracefully

    if (userError) {
      console.error("Get user data error:", userError)
      throw userError
    }

    // If no user data found, create it
    if (!userData) {
      console.log("No user data found, creating...")
      const { error: insertError } = await supabase.from("users").insert({
        id: user.id,
        email: user.email!,
        first_name: user.user_metadata?.first_name || "Unknown",
        last_name: user.user_metadata?.last_name || "User",
        role: user.user_metadata?.role || "intern",
        status: "active",
      })

      if (insertError) {
        console.error("Insert user error:", insertError)
        throw insertError
      }

      // Retry getting user data
      const { data: retryUserData, error: retryError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()

      if (retryError) {
        console.error("Retry get user error:", retryError)
        throw retryError
      }

      return retryUserData
    }

    return userData
  } catch (error) {
    console.error("GetCurrentUser error:", error)
    throw error
  }
}

// Project functions
export const createProject = async (project: Omit<Project, "id" | "created_at" | "updated_at">) => {
  try {
    const { data, error } = await supabase.from("projects").insert(project).select().single()

    if (error) {
      console.error("Create project error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Create project error:", error)
    throw error
  }
}

export const getProjects = async () => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        created_by_user:users!projects_created_by_fkey(first_name, last_name)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Get projects error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Get projects error:", error)
    throw error
  }
}

export const updateProject = async (id: string, updates: Partial<Project>) => {
  try {
    const { data, error } = await supabase.from("projects").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Update project error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Update project error:", error)
    throw error
  }
}

export const deleteProject = async (id: string) => {
  try {
    const { error } = await supabase.from("projects").delete().eq("id", id)

    if (error) {
      console.error("Delete project error:", error)
      throw error
    }
  } catch (error) {
    console.error("Delete project error:", error)
    throw error
  }
}

// Task functions
export const createTask = async (task: Omit<Task, "id" | "created_at" | "updated_at">) => {
  try {
    const { data, error } = await supabase.from("tasks").insert(task).select().single()

    if (error) {
      console.error("Create task error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Create task error:", error)
    throw error
  }
}

export const getTasks = async (projectId?: string) => {
  try {
    let query = supabase.from("tasks").select(`
        *,
        project:projects(name),
        assigned_user:users!tasks_assigned_to_fkey(first_name, last_name)
      `)

    if (projectId) {
      query = query.eq("project_id", projectId)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Get tasks error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Get tasks error:", error)
    throw error
  }
}

export const updateTask = async (id: string, updates: Partial<Task>) => {
  try {
    const { data, error } = await supabase.from("tasks").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Update task error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Update task error:", error)
    throw error
  }
}

// Report functions
export const createReport = async (report: Omit<Report, "id" | "created_at" | "updated_at">) => {
  try {
    const { data, error } = await supabase.from("reports").insert(report).select().single()

    if (error) {
      console.error("Create report error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Create report error:", error)
    throw error
  }
}

export const getReports = async () => {
  try {
    const { data, error } = await supabase
      .from("reports")
      .select(`
        *,
        project:projects(name),
        submitted_by_user:users!reports_submitted_by_fkey(first_name, last_name)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Get reports error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Get reports error:", error)
    throw error
  }
}

export const updateReport = async (id: string, updates: Partial<Report>) => {
  try {
    const { data, error } = await supabase.from("reports").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Update report error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Update report error:", error)
    throw error
  }
}

// Note functions
export const createNote = async (note: Omit<Note, "id" | "created_at" | "updated_at">) => {
  try {
    const { data, error } = await supabase.from("notes").insert(note).select().single()

    if (error) {
      console.error("Create note error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Create note error:", error)
    throw error
  }
}

export const getNotes = async (projectId?: string) => {
  try {
    let query = supabase.from("notes").select(`
        *,
        project:projects(name),
        created_by_user:users!notes_created_by_fkey(first_name, last_name)
      `)

    if (projectId) {
      query = query.eq("project_id", projectId)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Get notes error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Get notes error:", error)
    throw error
  }
}

export const updateNote = async (id: string, updates: Partial<Note>) => {
  try {
    const { data, error } = await supabase.from("notes").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Update note error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Update note error:", error)
    throw error
  }
}

export const deleteNote = async (id: string) => {
  try {
    const { error } = await supabase.from("notes").delete().eq("id", id)

    if (error) {
      console.error("Delete note error:", error)
      throw error
    }
  } catch (error) {
    console.error("Delete note error:", error)
    throw error
  }
}

// User management functions
export const getUsers = async () => {
  try {
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Get users error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Get users error:", error)
    throw error
  }
}

export const updateUser = async (id: string, updates: Partial<User>) => {
  try {
    const { data, error } = await supabase.from("users").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Update user error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Update user error:", error)
    throw error
  }
}

// File upload function
export const uploadFile = async (file: File, bucket: string, path: string) => {
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error("Upload file error:", error)
      throw error
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)

    return {
      path: data.path,
      url: urlData.publicUrl,
    }
  } catch (error) {
    console.error("Upload file error:", error)
    throw error
  }
}


// Notification functions
export const createNotification = async (notification: Omit<Notification, "id" | "created_at">) => {
  try {
    const { data, error } = await supabase.from("notifications").insert(notification).select().single()

    if (error) {
      console.error("Create notification error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Create notification error:", error)
    throw error
  }
}

export const getNotifications = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Get notifications error:", error)
      throw error
    }
    return data
  } catch (error) {
    console.error("Get notifications error:", error)
    throw error
  }
}

export const markNotificationAsRead = async (id: string) => {
  try {
    const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id)

    if (error) {
      console.error("Mark notification as read error:", error)
      throw error
    }
  } catch (error) {
    console.error("Mark notification as read error:", error)
    throw error
  }
}
