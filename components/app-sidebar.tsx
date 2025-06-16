"use client"

import type * as React from "react"
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
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { signOut } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    id: string
    first_name: string
    last_name: string
    email: string
    role: string
  }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      await signOut()
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of CloudTrack.",
      })
      router.push("/")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Navigation items based on role
  const getNavigationItems = () => {
    const baseItems = [
      {
        title: "Dashboard",
        url: `/dashboard/${user.role}`,
        icon: Home,
      },
    ]

    if (user.role === "admin") {
      return [
        ...baseItems,
        {
          title: "Projects",
          url: `/dashboard/${user.role}/projects`,
          icon: FolderOpen,
        },
        {
          title: "Team Management",
          url: `/dashboard/${user.role}/team`,
          icon: Users,
        },
        {
          title: "Reports",
          url: `/dashboard/${user.role}/reports`,
          icon: FileText,
        },
        {
          title: "Analytics",
          url: `/dashboard/${user.role}/analytics`,
          icon: BarChart3,
        },
        {
          title: "Notes",
          url: `/dashboard/${user.role}/notes`,
          icon: StickyNote,
        },
      ]
    }

    if (user.role === "staff") {
      return [
        ...baseItems,
        {
          title: "My Projects",
          url: `/dashboard/${user.role}/projects`,
          icon: FolderOpen,
        },
        {
          title: "My Interns",
          url: `/dashboard/${user.role}/interns`,
          icon: Users,
        },
        {
          title: "Submit Reports",
          url: `/dashboard/${user.role}/reports`,
          icon: FileText,
        },
        {
          title: "Notes",
          url: `/dashboard/${user.role}/notes`,
          icon: StickyNote,
        },
        {
          title: "Leave Request",
          url: `/dashboard/${user.role}/leave`,
          icon: Calendar,
        },
      ]
    }

    // Intern navigation
    return [
      ...baseItems,
      {
        title: "My Projects",
        url: `/dashboard/${user.role}/projects`,
        icon: FolderOpen,
      },
      {
        title: "Submit Updates",
        url: `/dashboard/${user.role}/updates`,
        icon: FileText,
      },
      {
        title: "Notes",
        url: `/dashboard/${user.role}/notes`,
        icon: StickyNote,
      },
      {
        title: "Announcements",
        url: `/dashboard/${user.role}/announcements`,
        icon: Bell,
      },
    ]
  }

  const navigationItems = getNavigationItems()

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Cloud className="h-8 w-8 text-primary" />
          <div className="flex flex-col">
            <span className="text-lg font-bold">CloudTrack</span>
            <span className="text-xs text-muted-foreground capitalize">{user.role} Dashboard</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src="/placeholder-user.jpg" alt={user.first_name} />
                    <AvatarFallback className="rounded-lg">
                      {user.first_name[0]}
                      {user.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user.first_name} {user.last_name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Activity className="mr-2 h-4 w-4" />
                  Activity Log
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-xs text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
