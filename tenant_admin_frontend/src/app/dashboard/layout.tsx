"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  Network,
  Layers,
  LineChart,
  Store,
  Cpu,
  LogOut,
  Bell,
  Menu,
  User,
} from "lucide-react"

interface SidebarItem {
  title: string
  icon: JSX.Element
  href: string
  submenu?: { title: string; href: string }[]
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    href: "/dashboard",
  },
  {
    title: "Tenant Management",
    icon: <Users className="h-5 w-5" />,
    href: "/dashboard/tenants",
    submenu: [
      { title: "Tenants & Subtenants", href: "/dashboard/tenants" },
      { title: "Context Isolation", href: "/dashboard/tenants/isolation" },
      { title: "Hierarchy", href: "/dashboard/tenants/hierarchy" },
    ],
  },
  {
    title: "Agent Configuration",
    icon: <Cpu className="h-5 w-5" />,
    href: "/dashboard/agents",
    submenu: [
      { title: "Personality Graph", href: "/dashboard/agents/personality" },
      { title: "Role Management", href: "/dashboard/agents/roles" },
      { title: "Experience History", href: "/dashboard/agents/history" },
    ],
  },
  {
    title: "Security & Governance",
    icon: <Shield className="h-5 w-5" />,
    href: "/dashboard/security",
    submenu: [
      { title: "Access Control", href: "/dashboard/security/access" },
      { title: "Audit Logs", href: "/dashboard/security/audit" },
      { title: "Policies", href: "/dashboard/security/policies" },
    ],
  },
  {
    title: "API & Integrations",
    icon: <Network className="h-5 w-5" />,
    href: "/dashboard/integrations",
    submenu: [
      { title: "API Manager", href: "/dashboard/integrations/api" },
      { title: "Channels", href: "/dashboard/integrations/channels" },
      { title: "Webhooks", href: "/dashboard/integrations/webhooks" },
    ],
  },
  {
    title: "Branding & Customization",
    icon: <Layers className="h-5 w-5" />,
    href: "/dashboard/branding",
    submenu: [
      { title: "Theme Editor", href: "/dashboard/branding/theme" },
      { title: "UI Customization", href: "/dashboard/branding/ui" },
    ],
  },
  {
    title: "Observability",
    icon: <LineChart className="h-5 w-5" />,
    href: "/dashboard/observability",
    submenu: [
      { title: "Data Flow", href: "/dashboard/observability/flow" },
      { title: "Metrics", href: "/dashboard/observability/metrics" },
      { title: "Monitoring", href: "/dashboard/observability/monitoring" },
    ],
  },
  {
    title: "Template Marketplace",
    icon: <Store className="h-5 w-5" />,
    href: "/dashboard/marketplace",
  },
  {
    title: "Settings",
    icon: <Settings className="h-5 w-5" />,
    href: "/dashboard/settings",
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const pathname = usePathname()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
    if (sidebarOpen) {
      setOpenSubmenu(null)
    }
  }

  const toggleSubmenu = (title: string) => {
    if (openSubmenu === title) {
      setOpenSubmenu(null)
    } else {
      setOpenSubmenu(title)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          {sidebarOpen && (
            <div className="text-lg font-semibold">Tenant Admin</div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="ml-auto"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Button>
        </div>

        <nav className="space-y-1 px-2 py-4">
          {sidebarItems.map((item) => (
            <div key={item.title} className="space-y-1">
              <Link
                href={item.href}
                onClick={() => item.submenu && toggleSubmenu(item.title)}
                className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                } ${!sidebarOpen ? "justify-center" : ""}`}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  {sidebarOpen && <span>{item.title}</span>}
                </div>
                {sidebarOpen && item.submenu && (
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${
                      openSubmenu === item.title ? "rotate-90" : ""
                    }`}
                  />
                )}
              </Link>

              {sidebarOpen &&
                item.submenu &&
                openSubmenu === item.title &&
                item.submenu.map((subitem) => (
                  <Link
                    key={subitem.title}
                    href={subitem.href}
                    className={`ml-9 flex rounded-md px-3 py-2 text-sm transition-colors ${
                      pathname === subitem.href
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {subitem.title}
                  </Link>
                ))}
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t p-4">
          <Button
            variant="ghost"
            className={`w-full justify-start ${
              !sidebarOpen ? "justify-center" : ""
            }`}
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="ml-2 font-medium md:text-xl">
              Enterprise Agentic AI Executive
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}