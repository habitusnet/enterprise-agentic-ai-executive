"use client"

import Link from "next/link"
import { 
  Users, 
  Bot, 
  Activity, 
  Shield, 
  Globe, 
  BarChart3,
  Settings,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Sparkles,
  PlusCircle,
  ChevronRight,
  Bell,
  Clock,
  Check,
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

// Sample data for dashboard
const tenantMetrics = {
  totalTenants: 5,
  activeTenants: 4,
  suspendedTenants: 1,
  tenantGrowth: 20, // percentage
  totalUsers: 789,
  userGrowth: 12, // percentage
}

const agentMetrics = {
  totalAgents: 44,
  activeAgents: 38,
  agentsInTraining: 6,
  conversationsToday: 1238,
  conversationGrowth: 15, // percentage
  averageRating: 4.7,
}

const securityMetrics = {
  securityEvents: 37,
  criticalAlerts: 2,
  pendingReviews: 5,
  complianceScore: 92, // percentage
  threatLevel: "low",
}

const integrationMetrics = {
  totalIntegrations: 12,
  activeIntegrations: 10,
  failedIntegrations: 2,
  apiCalls: 52890,
  apiGrowth: 8, // percentage
}

const recentActivity = [
  {
    id: "act-1",
    type: "tenant",
    action: "New tenant created",
    subject: "Enterprise Corp",
    timestamp: "2025-03-22T14:30:00Z",
    user: "admin@example.com",
  },
  {
    id: "act-2",
    type: "agent",
    action: "Agent personality updated",
    subject: "Customer Support Agent",
    timestamp: "2025-03-22T13:15:00Z",
    user: "jane.smith@example.com",
  },
  {
    id: "act-3",
    type: "security",
    action: "Unauthorized access attempt",
    subject: "API Authentication",
    timestamp: "2025-03-22T12:45:00Z",
    user: "system",
  },
  {
    id: "act-4",
    type: "integration",
    action: "New integration added",
    subject: "Salesforce CRM",
    timestamp: "2025-03-22T11:20:00Z",
    user: "john.doe@example.com",
  },
  {
    id: "act-5",
    type: "tenant",
    action: "Plan upgraded",
    subject: "Innovate Inc",
    timestamp: "2025-03-22T10:05:00Z",
    user: "admin@example.com",
  },
]

const quickActions = [
  {
    title: "Add New Tenant",
    description: "Create and configure a new enterprise tenant",
    icon: PlusCircle,
    href: "/dashboard/tenants/create",
    color: "bg-blue-500",
  },
  {
    title: "Configure Agent",
    description: "Customize AI agent personality and behavior",
    icon: Bot,
    href: "/dashboard/agents/personality",
    color: "bg-purple-500",
  },
  {
    title: "Review Security",
    description: "Check security alerts and audit logs",
    icon: Shield,
    href: "/dashboard/security/audit",
    color: "bg-red-500",
  },
  {
    title: "Add Integration",
    description: "Connect to external services and systems",
    icon: Globe,
    href: "/dashboard/integrations",
    color: "bg-green-500",
  },
]

const systemStatus = [
  {
    id: "status-1",
    name: "Core Platform",
    status: "operational",
    uptime: "99.99%",
  },
  {
    id: "status-2",
    name: "API Services",
    status: "operational",
    uptime: "99.97%",
  },
  {
    id: "status-3",
    name: "AI Processing",
    status: "operational",
    uptime: "99.95%",
  },
  {
    id: "status-4",
    name: "Database Systems",
    status: "degraded",
    uptime: "98.50%",
    message: "Minor performance issues",
  },
  {
    id: "status-5",
    name: "Integration Services",
    status: "operational",
    uptime: "99.92%",
  },
]

export default function DashboardPage() {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-100 text-green-800"
      case "degraded":
        return "bg-yellow-100 text-yellow-800"
      case "outage":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get activity icon based on type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "tenant":
        return <Users className="h-4 w-4" />
      case "agent":
        return <Bot className="h-4 w-4" />
      case "security":
        return <Shield className="h-4 w-4" />
      case "integration":
        return <Globe className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tenant metrics card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tenants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenantMetrics.totalTenants}</div>
            <p className="text-xs text-muted-foreground">
              {tenantMetrics.activeTenants} active, {tenantMetrics.suspendedTenants} suspended
            </p>
            <div className="flex items-center mt-4 text-sm">
              <ArrowUp className="h-4 w-4 mr-1 text-green-500" />
              <span>{tenantMetrics.tenantGrowth}% from last month</span>
            </div>
          </CardContent>
          <CardFooter className="p-2">
            <Link
              href="/dashboard/tenants"
              className="text-xs text-blue-500 hover:underline flex items-center"
            >
              View all tenants
              <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </CardFooter>
        </Card>

        {/* Agent metrics card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentMetrics.totalAgents}</div>
            <p className="text-xs text-muted-foreground">
              {agentMetrics.activeAgents} active, {agentMetrics.agentsInTraining} in training
            </p>
            <div className="flex justify-between mt-4 text-sm">
              <div>
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-1 text-amber-500" />
                  <span>{agentMetrics.averageRating}/5.0</span>
                </div>
                <p className="text-xs text-muted-foreground">Avg. rating</p>
              </div>
              <div>
                <div className="text-right">{agentMetrics.conversationsToday}</div>
                <p className="text-xs text-muted-foreground text-right">Conversations today</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-2">
            <Link
              href="/dashboard/agents"
              className="text-xs text-blue-500 hover:underline flex items-center"
            >
              Manage agents
              <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </CardFooter>
        </Card>

        {/* Security metrics card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Security</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics.securityEvents}</div>
            <p className="text-xs text-muted-foreground">
              Security events today
            </p>
            <div className="flex justify-between mt-4 text-sm">
              <div>
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1 text-red-500" />
                  <span>{securityMetrics.criticalAlerts} critical</span>
                </div>
                <p className="text-xs text-muted-foreground">Alerts</p>
              </div>
              <div>
                <div className="text-right">{securityMetrics.complianceScore}%</div>
                <p className="text-xs text-muted-foreground text-right">Compliance score</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-2">
            <Link
              href="/dashboard/security/audit"
              className="text-xs text-blue-500 hover:underline flex items-center"
            >
              View security logs
              <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </CardFooter>
        </Card>

        {/* Integration metrics card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Integrations</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrationMetrics.totalIntegrations}</div>
            <p className="text-xs text-muted-foreground">
              {integrationMetrics.activeIntegrations} active, {integrationMetrics.failedIntegrations} failed
            </p>
            <div className="flex items-center mt-4 text-sm">
              <ArrowUp className="h-4 w-4 mr-1 text-green-500" />
              <span>{integrationMetrics.apiGrowth}% API usage growth</span>
            </div>
          </CardContent>
          <CardFooter className="p-2">
            <Link
              href="/dashboard/integrations"
              className="text-xs text-blue-500 hover:underline flex items-center"
            >
              Manage integrations
              <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tenants">Tenants</TabsTrigger>
              <TabsTrigger value="agents">Agents</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="border rounded-md p-4 mt-3">
              <div className="h-[250px] flex items-center justify-center bg-muted/20 rounded-md">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Platform usage analytics visualization would appear here
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">User Activity</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total users</span>
                      <span className="font-medium">{tenantMetrics.totalUsers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active today</span>
                      <span className="font-medium">427</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">New registrations</span>
                      <div className="flex items-center">
                        <span className="font-medium mr-1">38</span>
                        <ArrowUp className="h-3 w-3 text-green-500" />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">API Usage</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total calls today</span>
                      <span className="font-medium">{integrationMetrics.apiCalls}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average response time</span>
                      <span className="font-medium">187ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Error rate</span>
                      <span className="font-medium">0.8%</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="tenants" className="border rounded-md p-4 mt-3">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Tenant Distribution</h3>
                  <Link href="/dashboard/tenants" className="text-xs text-blue-500 hover:underline">
                    View all
                  </Link>
                </div>
                <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Tenant distribution chart would appear here
                    </p>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Enterprise Plan</span>
                    <span className="font-medium">2 tenants</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Business Plan</span>
                    <span className="font-medium">2 tenants</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Standard Plan</span>
                    <span className="font-medium">1 tenant</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="agents" className="border rounded-md p-4 mt-3">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Agent Performance</h3>
                  <Link href="/dashboard/agents" className="text-xs text-blue-500 hover:underline">
                    View details
                  </Link>
                </div>
                <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Agent performance metrics would appear here
                    </p>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Response time (avg)</span>
                    <span className="font-medium">1.8 seconds</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Resolution rate</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">User satisfaction</span>
                    <span className="font-medium">4.7/5.0</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="border rounded-md p-4 mt-3">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Security Overview</h3>
                  <Link href="/dashboard/security" className="text-xs text-blue-500 hover:underline">
                    View details
                  </Link>
                </div>
                <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Security event visualization would appear here
                    </p>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Authentication events</span>
                    <span className="font-medium">245 today</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Failed login attempts</span>
                    <span className="font-medium">18 today</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Threat level</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Low
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest actions across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      activity.type === 'security' 
                        ? 'bg-red-100' 
                        : activity.type === 'agent'
                        ? 'bg-purple-100'
                        : activity.type === 'integration'
                        ? 'bg-green-100' 
                        : 'bg-blue-100'
                    }`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.subject}</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{formatDate(activity.timestamp)}</span>
                        <span className="mx-1">•</span>
                        <span>{activity.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                View All Activity
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action, index) => (
                <Link 
                  key={index}
                  href={action.href}
                  className="block p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full ${action.color} flex items-center justify-center`}>
                      <action.icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Platform component health
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {systemStatus.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      item.status === 'operational' 
                        ? 'bg-green-500' 
                        : item.status === 'degraded'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeClass(item.status)}`}>
                      {item.status}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">{item.uptime}</span>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Link
                href="#"
                className="text-xs text-blue-500 hover:underline flex items-center w-full justify-center"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Status Page
              </Link>
            </CardFooter>
          </Card>

          {/* System Announcements */}
          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
              <CardDescription>
                Important updates and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-md border p-3 bg-blue-50 border-blue-200">
                <div className="font-medium text-sm mb-1">Maintenance Scheduled</div>
                <p className="text-xs text-muted-foreground">
                  System maintenance scheduled for March 28, 2025 from 1:00 AM to 3:00 AM UTC
                </p>
              </div>
              <div className="rounded-md border p-3">
                <div className="font-medium text-sm mb-1">New Feature: Advanced Analytics</div>
                <p className="text-xs text-muted-foreground">
                  Enhanced analytics dashboard now available for all enterprise tenants
                </p>
              </div>
              <div className="rounded-md border p-3">
                <div className="font-medium text-sm mb-1">Version 2.5 Released</div>
                <p className="text-xs text-muted-foreground">
                  Platform update with improved performance and new agent capabilities
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}