"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  BarChart3,
  Bell,
  Cloud,
  FileText,
  FolderOpen,
  Home,
  LogOut,
  Settings,
  StickyNote,
  Users,
  Calendar,
  Activity,
  Menu,
  ChevronLeft,
  X,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { signOut } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface AppSidebarProps {
  user: {
    id: string
    first_name: string
    last_name: string
    email: string
    role: string
  }
}

export function AppSidebar({ user }: AppSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      })
      router.push("/")
    } catch {
      toast({
        title: "Logout failed",
        description: "Something went wrong.",
        variant: "destructive",
      })
    }
  }

  const getNavigationItems = () => {
    const base = [
      { title: "Dashboard", url: `/dashboard/${user.role}`, icon: Home },
    ]

    if (user.role === "admin") {
      return [
        ...base,
        { title: "Projects", url: `/dashboard/${user.role}/projects`, icon: FolderOpen },
        { title: "Team", url: `/dashboard/${user.role}/team`, icon: Users },
        { title: "Reports", url: `/dashboard/${user.role}/reports`, icon: FileText },
        { title: "Analytics", url: `/dashboard/${user.role}/analytics`, icon: BarChart3 },
        { title: "Notes", url: `/dashboard/${user.role}/notes`, icon: StickyNote },
      ]
    }

    if (user.role === "staff") {
      return [
        ...base,
        { title: "My Projects", url: `/dashboard/${user.role}/projects`, icon: FolderOpen },
        { title: "My Interns", url: `/dashboard/${user.role}/interns`, icon: Users },
        { title: "Reports", url: `/dashboard/${user.role}/reports`, icon: FileText },
        { title: "Notes", url: `/dashboard/${user.role}/notes`, icon: StickyNote },
        { title: "Leave", url: `/dashboard/${user.role}/leave`, icon: Calendar },
      ]
    }

    return [
      ...base,
      { title: "Projects", url: `/dashboard/${user.role}/projects`, icon: FolderOpen },
      { title: "Updates", url: `/dashboard/${user.role}/updates`, icon: FileText },
      { title: "Notes", url: `/dashboard/${user.role}/notes`, icon: StickyNote },
      { title: "Announcements", url: `/dashboard/${user.role}/announcements`, icon: Bell },
    ]
  }

  const navigationItems = getNavigationItems()

  // Desktop Sidebar (always visible on lg and up)
  const SidebarContent = (
    <div
      className={`h-full bg-white dark:bg-zinc-900 border-r shadow-sm flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Top Section */}
      <div className="flex items-center justify-between px-4 py-5 border-b dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Cloud className="h-6 w-6 text-primary" />
          {!collapsed && (
            <div>
              <p className="font-bold text-lg leading-tight">CloudTrack</p>
              <p className="text-xs text-muted-foreground">{user.role} Dashboard</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted-foreground hover:text-primary transition hidden lg:block"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
        {/* Mobile close icon */}
        <button
          onClick={() => setMobileOpen(false)}
          className="text-muted-foreground hover:text-primary transition lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 mt-6 px-3">
        {navigationItems.map((item) => {
          const isActive = pathname === item.url
          return (
            <a
              key={item.title}
              href={item.url}
              className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-all group ${
                isActive
                  ? "bg-primary text-white"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {!collapsed && <span className="transition-all duration-200">{item.title}</span>}
            </a>
          )
        })}
      </nav>

      <div className="flex-1" />

      {/* Bottom Profile */}
      <div className="border-t dark:border-zinc-800 px-4 py-4 space-y-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" alt="User" />
                <AvatarFallback>{user.first_name[0]}{user.last_name[0]}</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="leading-tight">
                  <p className="text-sm font-semibold">{user.first_name} {user.last_name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
              <Settings className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Activity className="mr-2 h-4 w-4" /> Activity
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {!collapsed && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Icon - fixed at top right of dashboard header text area */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-md bg-muted text-muted-foreground shadow hover:text-primary"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile Sidebar Panel */}
      <div
        className={`fixed top-0 left-0 z-50 h-full transition-transform duration-300 lg:static ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {SidebarContent}
      </div>
    </>
  )
}
