import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  CheckCircle,
  Users,
  BarChart3,
  Bell,
  FileText,
  Settings,
  Cloud,
  ArrowRight,
  Star,
  Rocket,
  Target,
  Globe,
  Smartphone,
  Database,
  Lock,
  Play,
  TrendingUp,
  Zap,
  Shield,
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 group-hover:scale-110 transition-transform duration-300">
              <Cloud className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CloudTrack
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Login</Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300"
            >
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8 animate-fade-in-up">
              <Badge
                variant="secondary"
                className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 hover:scale-105 transition-transform duration-300 w-fit"
              >
                <Star className="mr-1 h-3 w-3" />
                Trusted by CloudWare Technologies
              </Badge>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-tight">
                Transform Your{" "}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
                  Team Management
                </span>
              </h1>

              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                Cloudtrack centralized projects, resources and staff management platform tailored for Cloudware Technologies to streamline workflow, collaboration, and resources visibility across team.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  asChild
                  className="text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Link href="/register">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="text-lg border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transform hover:scale-105 transition-all duration-300"
                >
                  <Link href="/login">
                    <Play className="mr-2 h-5 w-5" />
                    Watch Demo
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-sm text-gray-600 dark:text-gray-400 pt-4">
                <div className="flex items-center gap-2 hover:text-green-600 transition-colors">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Free to start
                </div>
                <div className="flex items-center gap-2 hover:text-green-600 transition-colors">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2 hover:text-green-600 transition-colors">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Setup in minutes
                </div>
              </div>
            </div>

            {/* Interactive Dashboard Preview */}
            <div className="relative animate-fade-in-right">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 sm:p-8 border hover:shadow-3xl transition-all duration-500 transform hover:scale-105">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin-slow"></div>
                      <span className="font-semibold text-sm sm:text-base">CloudTrack Dashboard</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 animate-pulse">
                      Live
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600 animate-count-up">24</div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Active Projects</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors cursor-pointer">
                      <div className="text-xl sm:text-2xl font-bold text-purple-600 animate-count-up">156</div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Tasks Completed</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors cursor-pointer">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                      <span className="text-xs sm:text-sm">Project Alpha - 95% Complete</span>
                    </div>
                    <div className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors cursor-pointer">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-xs sm:text-sm">Mobile App - In Progress</span>
                    </div>
                    <div className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors cursor-pointer">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs sm:text-sm">Database Migration - Planning</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-gray-800 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-12 sm:mb-16 animate-fade-in-up">
            <h2 className="mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                succeed
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
              Powerful features designed to streamline your workflow and boost team productivity.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Users,
                title: "Smart Role Management",
                description:
                  "Intelligent role-based access with customized dashboards for Admin, Staff, and Intern roles.",
                color: "from-blue-500 to-blue-600",
                hoverColor: "hover:border-blue-200 dark:hover:border-blue-800",
              },
              {
                icon: Bell,
                title: "Real-Time Notifications",
                description:
                  "Instant updates and notifications keep your team synchronized and informed about project changes.",
                color: "from-purple-500 to-purple-600",
                hoverColor: "hover:border-purple-200 dark:hover:border-purple-800",
              },
              {
                icon: Target,
                title: "Advanced Task Management",
                description:
                  "Sophisticated project and task assignment system with progress tracking and deadline management.",
                color: "from-green-500 to-green-600",
                hoverColor: "hover:border-green-200 dark:hover:border-green-800",
              },
              {
                icon: BarChart3,
                title: "Powerful Analytics",
                description:
                  "Comprehensive reports and analytics with Excel export functionality for data-driven decisions.",
                color: "from-orange-500 to-orange-600",
                hoverColor: "hover:border-orange-200 dark:hover:border-orange-800",
              },
              {
                icon: FileText,
                title: "Collaborative Documentation",
                description: "Integrated note-taking and documentation system to keep your team aligned and informed.",
                color: "from-pink-500 to-pink-600",
                hoverColor: "hover:border-pink-200 dark:hover:border-pink-800",
              },
              {
                icon: Settings,
                title: "Profile Management",
                description:
                  "Complete user profile management with image uploads and customizable settings for all roles.",
                color: "from-indigo-500 to-indigo-600",
                hoverColor: "hover:border-indigo-200 dark:hover:border-indigo-800",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className={`relative overflow-hidden border-2 ${feature.hoverColor} transition-all duration-300 hover:shadow-lg group animate-fade-in-up cursor-pointer`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div
                    className={`mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r ${feature.color} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="group-hover:text-blue-600 transition-colors">{feature.title}</CardTitle>
                  <CardDescription className="group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-12 sm:mb-16 animate-fade-in-up">
            <h2 className="mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold">Built with cutting-edge technology</h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
              Powered by modern tools and frameworks for maximum performance and reliability.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Globe,
                title: "Next.js 15",
                description: "Modern React framework for optimal performance",
                color: "bg-blue-100 dark:bg-blue-900",
              },
              {
                icon: Database,
                title: "Supabase",
                description: "Powerful backend with real-time capabilities",
                color: "bg-green-100 dark:bg-green-900",
              },
              {
                icon: Smartphone,
                title: "Responsive Design",
                description: "Perfect experience on all devices",
                color: "bg-purple-100 dark:bg-purple-900",
              },
              {
                icon: Lock,
                title: "Enterprise Security",
                description: "Bank-level security and data protection",
                color: "bg-red-100 dark:bg-red-900",
              },
            ].map((tech, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up cursor-pointer"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${tech.color}`}>
                  <tech.icon className="h-8 w-8 text-gray-700 dark:text-gray-300" />
                </div>
                <h3 className="mb-2 text-lg sm:text-xl font-semibold">{tech.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-center">
            {[
              { number: "10K+", label: "Active Users", icon: Users },
              { number: "50K+", label: "Projects Completed", icon: Target },
              { number: "99.9%", label: "Uptime", icon: TrendingUp },
              { number: "24/7", label: "Support", icon: Shield },
            ].map((stat, index) => (
              <div
                key={index}
                className="animate-fade-in-up hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-center mb-4">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">{stat.number}</div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="mx-auto max-w-4xl text-center text-white animate-fade-in-up">
            <h2 className="mb-4 text-2xl sm:text-3xl lg:text-5xl font-bold">Ready to revolutionize your workflow?</h2>
            <p className="mb-8 text-lg sm:text-xl opacity-90">
              Join thousands of teams already using CloudTrack to boost productivity and streamline operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                asChild
                className="text-lg bg-white text-blue-600 hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Link href="/register">
                  <Rocket className="mr-2 h-5 w-5" />
                  Start Free Today
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-lg border-white text-white hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-300"
              >
                <Link href="/login">
                  <Zap className="mr-2 h-5 w-5" />
                  Sign In
                </Link>
              </Button>
            </div>
            <p className="mt-6 text-sm opacity-75">No credit card required • Free forever plan available</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                  <Cloud className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CloudTrack
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Transforming team collaboration with intelligent project management solutions.
              </p>
            </div>

            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Security", "Integrations"],
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Contact"],
              },
              {
                title: "Support",
                links: ["Help Center", "Documentation", "API Reference", "Status"],
              },
            ].map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link href="#" className="hover:text-blue-600 transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400">© 2024 CloudWare Technologies. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              {["Privacy", "Terms", "Cookies"].map((link, index) => (
                <Link
                  key={index}
                  href="#"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {link}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
