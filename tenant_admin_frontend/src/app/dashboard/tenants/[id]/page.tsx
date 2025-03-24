"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Edit2,
  Trash2,
  UserPlus,
  Users,
  Bot,
  Activity,
  Settings,
  BarChart3,
  Clock,
  Building,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  Copy,
  ChevronRight,
  Save
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Temp data - would be fetched from API in production
const tenants = [
  {
    id: "t1",
    name: "Enterprise Corp",
    slug: "enterprise-corp",
    status: "active",
    plan: "Enterprise",
    usersCount: 248,
    agentsCount: 12,
    apiUsage: "87%",
    apiUsageRaw: 87,
    createdAt: "2024-03-15",
    industry: "Technology",
    contactName: "John Anderson",
    contactEmail: "john.anderson@enterprise-corp.com",
    contactPhone: "+1 (555) 123-4567",
    address: "123 Business Ave, San Francisco, CA 94105",
    website: "https://enterprise-corp.com",
    size: "Large (501-5000 employees)",
    description: "Enterprise Corp is a leading technology company specializing in enterprise software solutions for the healthcare and finance industries.",
    lastBillingDate: "2024-04-10",
    nextBillingDate: "2024-05-10",
    billingPlan: "$4,999/month",
    dataRetention: "90 days",
    enabledFeatures: ["Custom agents", "API access", "Advanced analytics", "SSO", "Audit logging"],
    recentUsers: [
      { id: "u1", name: "Sarah Miller", email: "s.miller@enterprise-corp.com", role: "Admin", lastActive: "2024-04-19" },
      { id: "u2", name: "Robert Chen", email: "r.chen@enterprise-corp.com", role: "Manager", lastActive: "2024-04-18" },
      { id: "u3", name: "Emily Parker", email: "e.parker@enterprise-corp.com", role: "User", lastActive: "2024-04-17" },
      { id: "u4", name: "Michael Davis", email: "m.davis@enterprise-corp.com", role: "User", lastActive: "2024-04-16" },
    ],
    recentAgents: [
      { id: "a1", name: "Sales Assistant", type: "Custom", interactions: 1245, lastUsed: "2024-04-19" },
      { id: "a2", name: "Support Specialist", type: "Custom", interactions: 967, lastUsed: "2024-04-19" },
      { id: "a3", name: "Data Analyst", type: "Template", interactions: 524, lastUsed: "2024-04-18" },
    ],
    usageMetrics: {
      apiCallsThisMonth: 24879,
      apiCallsLastMonth: 22145,
      activeUsersThisMonth: 187,
      activeUsersLastMonth: 173,
      totalInteractions: 35698,
      averageDailyUsers: 124,
      averageSessionDuration: "14m 23s"
    },
    usageHistory: [
      { month: "Nov", usage: 65 },
      { month: "Dec", usage: 72 },
      { month: "Jan", usage: 68 },
      { month: "Feb", usage: 75 },
      { month: "Mar", usage: 82 },
      { month: "Apr", usage: 87 }
    ]
  },
  {
    id: "t2",
    name: "Innovate Inc",
    slug: "innovate-inc",
    status: "active",
    plan: "Business",
    usersCount: 76,
    agentsCount: 8,
    apiUsage: "53%",
    apiUsageRaw: 53,
    createdAt: "2024-04-02",
    industry: "Marketing",
    contactName: "Jessica Lee",
    contactEmail: "jessica@innovate-inc.com",
    contactPhone: "+1 (555) 234-5678",
    address: "456 Innovation Way, Austin, TX 78701",
    website: "https://innovate-inc.com",
    size: "Medium (51-500 employees)",
    description: "Innovate Inc provides cutting-edge marketing automation solutions for growing businesses.",
    lastBillingDate: "2024-04-05",
    nextBillingDate: "2024-05-05",
    billingPlan: "$1,999/month",
    dataRetention: "60 days",
    enabledFeatures: ["Custom agents", "API access", "Basic analytics"],
    recentUsers: [
      { id: "u5", name: "Alex Wong", email: "alex@innovate-inc.com", role: "Admin", lastActive: "2024-04-19" },
      { id: "u6", name: "Sophia Martinez", email: "sophia@innovate-inc.com", role: "Manager", lastActive: "2024-04-17" },
    ],
    recentAgents: [
      { id: "a4", name: "Content Creator", type: "Custom", interactions: 743, lastUsed: "2024-04-18" },
      { id: "a5", name: "SEO Analyst", type: "Template", interactions: 512, lastUsed: "2024-04-15" },
    ],
    usageMetrics: {
      apiCallsThisMonth: 12678,
      apiCallsLastMonth: 11435,
      activeUsersThisMonth: 54,
      activeUsersLastMonth: 48,
      totalInteractions: 18954,
      averageDailyUsers: 42,
      averageSessionDuration: "12m 37s"
    },
    usageHistory: [
      { month: "Nov", usage: 32 },
      { month: "Dec", usage: 38 },
      { month: "Jan", usage: 45 },
      { month: "Feb", usage: 48 },
      { month: "Mar", usage: 51 },
      { month: "Apr", usage: 53 }
    ]
  },
  {
    id: "t3",
    name: "Tech Solutions",
    slug: "tech-solutions",
    status: "pending",
    plan: "Standard",
    usersCount: 18,
    agentsCount: 3,
    apiUsage: "12%",
    apiUsageRaw: 12,
    createdAt: "2024-04-18",
    industry: "IT Services",
    contactName: "David Wilson",
    contactEmail: "d.wilson@techsolutions.com",
    contactPhone: "+1 (555) 345-6789",
    address: "789 Tech Blvd, Boston, MA 02110",
    website: "https://techsolutions.com",
    size: "Small (1-50 employees)",
    description: "Tech Solutions provides IT consulting and support services for small and medium businesses.",
    lastBillingDate: "2024-04-18",
    nextBillingDate: "2024-05-18",
    billingPlan: "$499/month",
    dataRetention: "30 days",
    enabledFeatures: ["Template agents", "Basic analytics"],
    recentUsers: [
      { id: "u7", name: "Kevin Thompson", email: "kevin@techsolutions.com", role: "Admin", lastActive: "2024-04-18" },
    ],
    recentAgents: [
      { id: "a6", name: "IT Helpdesk", type: "Template", interactions: 89, lastUsed: "2024-04-18" },
    ],
    usageMetrics: {
      apiCallsThisMonth: 2456,
      apiCallsLastMonth: 0,
      activeUsersThisMonth: 12,
      activeUsersLastMonth: 0,
      totalInteractions: 487,
      averageDailyUsers: 8,
      averageSessionDuration: "8m 14s"
    },
    usageHistory: [
      { month: "Nov", usage: 0 },
      { month: "Dec", usage: 0 },
      { month: "Jan", usage: 0 },
      { month: "Feb", usage: 0 },
      { month: "Mar", usage: 0 },
      { month: "Apr", usage: 12 }
    ]
  },
  {
    id: "t4",
    name: "Global Services",
    slug: "global-services",
    status: "active",
    plan: "Enterprise",
    usersCount: 415,
    agentsCount: 15,
    apiUsage: "92%",
    apiUsageRaw: 92,
    createdAt: "2024-01-20",
    industry: "Consulting",
    contactName: "Maria Rodriguez",
    contactEmail: "m.rodriguez@globalservices.com",
    contactPhone: "+1 (555) 456-7890",
    address: "101 Global Plaza, New York, NY 10001",
    website: "https://globalservices.com",
    size: "Enterprise (5000+ employees)",
    description: "Global Services is an international consulting firm offering business transformation and technology services.",
    lastBillingDate: "2024-04-01",
    nextBillingDate: "2024-05-01",
    billingPlan: "$7,999/month",
    dataRetention: "365 days",
    enabledFeatures: ["Custom agents", "API access", "Advanced analytics", "SSO", "Audit logging", "24/7 Support"],
    recentUsers: [
      { id: "u8", name: "Thomas Johnson", email: "t.johnson@globalservices.com", role: "Admin", lastActive: "2024-04-19" },
      { id: "u9", name: "Laura Schmidt", email: "l.schmidt@globalservices.com", role: "Manager", lastActive: "2024-04-19" },
      { id: "u10", name: "Carlos Mendez", email: "c.mendez@globalservices.com", role: "Manager", lastActive: "2024-04-18" },
    ],
    recentAgents: [
      { id: "a7", name: "Business Analyst", type: "Custom", interactions: 2356, lastUsed: "2024-04-19" },
      { id: "a8", name: "Project Manager", type: "Custom", interactions: 1843, lastUsed: "2024-04-19" },
      { id: "a9", name: "Financial Advisor", type: "Custom", interactions: 1729, lastUsed: "2024-04-18" },
    ],
    usageMetrics: {
      apiCallsThisMonth: 43567,
      apiCallsLastMonth: 41298,
      activeUsersThisMonth: 382,
      activeUsersLastMonth: 365,
      totalInteractions: 87543,
      averageDailyUsers: 298,
      averageSessionDuration: "17m 45s"
    },
    usageHistory: [
      { month: "Nov", usage: 78 },
      { month: "Dec", usage: 82 },
      { month: "Jan", usage: 85 },
      { month: "Feb", usage: 87 },
      { month: "Mar", usage: 90 },
      { month: "Apr", usage: 92 }
    ]
  },
  {
    id: "t5",
    name: "Digital Agency",
    slug: "digital-agency",
    status: "suspended",
    plan: "Business",
    usersCount: 32,
    agentsCount: 6,
    apiUsage: "46%",
    apiUsageRaw: 46,
    createdAt: "2024-02-11",
    industry: "Creative",
    contactName: "Ryan Peters",
    contactEmail: "ryan@digitalagency.com",
    contactPhone: "+1 (555) 567-8901",
    address: "202 Creative Studio, Portland, OR 97201",
    website: "https://digitalagency.com",
    size: "Small (1-50 employees)",
    description: "Digital Agency provides creative digital marketing and design services for modern brands.",
    lastBillingDate: "2024-03-11",
    nextBillingDate: "2024-04-11 (Overdue)",
    billingPlan: "$1,499/month",
    dataRetention: "60 days",
    enabledFeatures: ["Custom agents", "API access", "Basic analytics"],
    recentUsers: [
      { id: "u11", name: "Amy Peterson", email: "amy@digitalagency.com", role: "Admin", lastActive: "2024-03-15" },
      { id: "u12", name: "Jason Kim", email: "jason@digitalagency.com", role: "Manager", lastActive: "2024-03-14" },
    ],
    recentAgents: [
      { id: "a10", name: "Design Assistant", type: "Custom", interactions: 876, lastUsed: "2024-03-15" },
      { id: "a11", name: "Content Strategist", type: "Custom", interactions: 654, lastUsed: "2024-03-14" },
    ],
    usageMetrics: {
      apiCallsThisMonth: 4532,
      apiCallsLastMonth: 8763,
      activeUsersThisMonth: 12,
      activeUsersLastMonth: 27,
      totalInteractions: 12453,
      averageDailyUsers: 0,
      averageSessionDuration: "10m 22s"
    },
    usageHistory: [
      { month: "Nov", usage: 28 },
      { month: "Dec", usage: 32 },
      { month: "Jan", usage: 38 },
      { month: "Feb", usage: 42 },
      { month: "Mar", usage: 46 },
      { month: "Apr", usage: 46 }
    ]
  }
]

export default function TenantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [tenant, setTenant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  useEffect(() => {
    // In a real app, this would be an API call
    // params.id could be a string or array, so we need to handle both cases
    const id = Array.isArray(params.id) ? params.id[0] : params.id
    console.log("Looking for tenant with ID:", id)
    const foundTenant = tenants.find(t => t.id === id)
    setTenant(foundTenant || null)
    setLoading(false)
  }, [params.id])
  
  const handleDeleteTenant = () => {
    // In a real app, this would be an API call
    console.log("Deleting tenant:", tenant?.id)
    setIsDeleteDialogOpen(false)
    
    // Navigate back to tenants list
    router.push("/dashboard/tenants")
  }
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "suspended":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "suspended":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Loading tenant details...</p>
      </div>
    )
  }
  
  if (!tenant) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <AlertCircle className="h-8 w-8 text-red-600 mb-4" />
        <h2 className="text-xl font-bold mb-2">Tenant Not Found</h2>
        <p className="text-muted-foreground mb-4">The tenant you're looking for doesn't exist or you don't have access to it.</p>
        <Button asChild>
          <Link href="/dashboard/tenants">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tenants
          </Link>
        </Button>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/tenants">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{tenant.name}</h1>
            <p className="text-muted-foreground">{tenant.slug}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/tenants/${tenant.id}/edit`}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit Tenant
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>Actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Tenant Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/tenants/${tenant.id}/settings`}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Manage Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/tenants/${tenant.id}/users`}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>Add Users</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/tenants/${tenant.id}/agents`}>
                  <Bot className="mr-2 h-4 w-4" />
                  <span>Manage Agents</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Tenant</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Status Card */}
      <div className={`border rounded-md p-3 flex items-center gap-3 ${getStatusBadgeClass(tenant.status)}`}>
        {getStatusIcon(tenant.status)}
        <div>
          <p className="font-medium">
            Status: <span className="capitalize">{tenant.status}</span>
          </p>
          <p className="text-sm">
            {tenant.status === "active" ? "This tenant is active and fully operational" : 
             tenant.status === "pending" ? "This tenant is pending activation or review" :
             "This tenant is currently suspended due to billing or compliance issues"}
          </p>
        </div>
      </div>
      
      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Tenant Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="text-sm text-muted-foreground">Plan</div>
                <div className="text-sm font-medium">{tenant.plan}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm text-muted-foreground">Created</div>
                <div className="text-sm font-medium">{tenant.createdAt}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm text-muted-foreground">Industry</div>
                <div className="text-sm font-medium">{tenant.industry}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm text-muted-foreground">Size</div>
                <div className="text-sm font-medium">{tenant.size}</div>
              </div>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">{tenant.description}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div className="text-sm text-muted-foreground">Contact</div>
                <div className="text-sm font-medium text-right">{tenant.contactName}</div>
              </div>
              <div className="flex justify-between items-start">
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="text-sm font-medium text-right truncate max-w-[60%]">
                  <a href={`mailto:${tenant.contactEmail}`} className="hover:underline">
                    {tenant.contactEmail}
                  </a>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div className="text-sm text-muted-foreground">Phone</div>
                <div className="text-sm font-medium text-right">{tenant.contactPhone}</div>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="text-sm text-muted-foreground">Website</div>
                  <div className="text-sm font-medium text-right">
                    <a href={tenant.website} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline">
                      {tenant.website.replace(/^https?:\/\//, '')}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div className="text-sm text-muted-foreground">Address</div>
                  <div className="text-sm font-medium text-right">{tenant.address}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Usage Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="text-sm text-muted-foreground">Active Users</div>
                <div className="text-sm font-medium">{tenant.usersCount} / {tenant.plan === "Enterprise" ? "Unlimited" : "500"}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm text-muted-foreground">Active Agents</div>
                <div className="text-sm font-medium">{tenant.agentsCount} / {tenant.plan === "Enterprise" ? "Unlimited" : "10"}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm text-muted-foreground">API Usage</div>
                <div className="text-sm font-medium">{tenant.apiUsage}</div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 dark:bg-gray-200">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: tenant.apiUsage }}
                ></div>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="text-sm text-muted-foreground">Billing</div>
                  <div className="text-sm font-medium">{tenant.billingPlan}</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm text-muted-foreground">Last Billed</div>
                  <div className="text-sm font-medium">{tenant.lastBillingDate}</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm text-muted-foreground">Next Billing</div>
                  <div className={`text-sm font-medium ${tenant.status === "suspended" ? "text-red-600" : ""}`}>
                    {tenant.nextBillingDate}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="mt-2">
        <TabsList className="grid grid-cols-5 w-full max-w-4xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="usage">Usage & Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Trend</CardTitle>
                <CardDescription>
                  API and resource usage over the past 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] flex items-end justify-between gap-2">
                  {tenant.usageHistory.map((month: any, index: number) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="w-12 bg-primary rounded-t" 
                        style={{ 
                          height: `${month.usage * 2}px`,
                          opacity: 0.2 + (index * 0.15)
                        }}
                      ></div>
                      <div className="text-xs text-muted-foreground mt-2">{month.month}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                Current billing cycle usage: {tenant.apiUsage}
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Features & Limits</CardTitle>
                <CardDescription>
                  Enabled features and resource allocations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Enabled Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {tenant.enabledFeatures.map((feature: string, index: number) => (
                        <div 
                          key={index}
                          className="text-xs bg-primary/10 text-primary rounded-full px-2 py-1"
                        >
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Resource Limits</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-muted-foreground">User Accounts</span>
                          <span className="text-xs font-medium">{tenant.usersCount} / {tenant.plan === "Enterprise" ? "Unlimited" : "500"}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 dark:bg-gray-200">
                          <div 
                            className="bg-primary h-1.5 rounded-full" 
                            style={{ width: `${tenant.plan === "Enterprise" ? 25 : (tenant.usersCount / 500) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-muted-foreground">AI Agents</span>
                          <span className="text-xs font-medium">{tenant.agentsCount} / {tenant.plan === "Enterprise" ? "Unlimited" : "10"}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 dark:bg-gray-200">
                          <div 
                            className="bg-primary h-1.5 rounded-full" 
                            style={{ width: `${tenant.plan === "Enterprise" ? 35 : (tenant.agentsCount / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-muted-foreground">API Usage</span>
                          <span className="text-xs font-medium">{tenant.apiUsage} of quota</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 dark:bg-gray-200">
                          <div 
                            className={`h-1.5 rounded-full ${tenant.apiUsageRaw > 90 ? 'bg-red-500' : 'bg-primary'}`}
                            style={{ width: tenant.apiUsage }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Data Retention</span>
                          <span className="text-xs font-medium">{tenant.dataRetention}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Users</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/tenants/${tenant.id}/users`}>
                      View All <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tenant.recentUsers.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm py-4">No users yet</p>
                  ) : (
                    tenant.recentUsers.map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                        <div className="text-xs">
                          <span className={`px-2 py-1 rounded-full ${user.role === 'Admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Active Agents</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/tenants/${tenant.id}/agents`}>
                      View All <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tenant.recentAgents.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm py-4">No agents yet</p>
                  ) : (
                    tenant.recentAgents.map((agent: any) => (
                      <div key={agent.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{agent.name}</div>
                            <div className="text-xs text-muted-foreground">{agent.type}</div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {agent.interactions.toLocaleString()} interactions
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage users for this tenant</CardDescription>
                </div>
                <Button asChild>
                  <Link href={`/dashboard/tenants/${tenant.id}/users/add`}>
                    <UserPlus className="mr-2 h-4 w-4" /> Add User
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenant.recentUsers.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'Admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>{user.lastActive}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" title="Edit">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Remove">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {tenant.recentUsers.length} of {tenant.usersCount} users
              </div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="agents" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>AI Agent Management</CardTitle>
                  <CardDescription>Manage AI agents for this tenant</CardDescription>
                </div>
                <Button asChild>
                  <Link href={`/dashboard/tenants/${tenant.id}/agents/create`}>
                    <Bot className="mr-2 h-4 w-4" /> Create Agent
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Interactions</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenant.recentAgents.map((agent: any) => (
                      <TableRow key={agent.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Bot className="h-4 w-4 text-primary" />
                            </div>
                            <div className="font-medium">{agent.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${agent.type === 'Custom' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                            {agent.type}
                          </span>
                        </TableCell>
                        <TableCell>{agent.interactions.toLocaleString()}</TableCell>
                        <TableCell>{agent.lastUsed}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" title="Edit">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Remove">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {tenant.recentAgents.length} of {tenant.agentsCount} agents
              </div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="usage" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>API and resource usage metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">API Calls (This Month)</h4>
                  <div className="text-2xl font-bold mt-2">{tenant.usageMetrics.apiCallsThisMonth.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {tenant.usageMetrics.apiCallsLastMonth > 0 
                      ? `${((tenant.usageMetrics.apiCallsThisMonth / tenant.usageMetrics.apiCallsLastMonth - 1) * 100).toFixed(1)}% from last month`
                      : "No data from last month"}
                  </div>
                </div>
                
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Active Users (This Month)</h4>
                  <div className="text-2xl font-bold mt-2">{tenant.usageMetrics.activeUsersThisMonth.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {tenant.usageMetrics.activeUsersLastMonth > 0
                      ? `${((tenant.usageMetrics.activeUsersThisMonth / tenant.usageMetrics.activeUsersLastMonth - 1) * 100).toFixed(1)}% from last month`
                      : "No data from last month"}
                  </div>
                </div>
                
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Total Interactions</h4>
                  <div className="text-2xl font-bold mt-2">{tenant.usageMetrics.totalInteractions.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Across all agents
                  </div>
                </div>
                
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Average Daily Users</h4>
                  <div className="text-2xl font-bold mt-2">{tenant.usageMetrics.averageDailyUsers.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {((tenant.usageMetrics.averageDailyUsers / tenant.usersCount) * 100).toFixed(1)}% of total users
                  </div>
                </div>
                
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Average Session Duration</h4>
                  <div className="text-2xl font-bold mt-2">{tenant.usageMetrics.averageSessionDuration}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Per user session
                  </div>
                </div>
                
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">API Usage</h4>
                  <div className="text-2xl font-bold mt-2">{tenant.apiUsage}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Of allocated quota
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Usage Trend (6 Months)</h3>
                <div className="h-[300px] flex items-end justify-between gap-2">
                  {tenant.usageHistory.map((month: any, index: number) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div 
                        className="w-full bg-primary rounded-t" 
                        style={{ 
                          height: `${month.usage * 2.5}px`,
                          opacity: 0.2 + (index * 0.15)
                        }}
                      ></div>
                      <div className="text-xs text-muted-foreground mt-2">{month.month}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Tenant Settings
                  </CardTitle>
                  <CardDescription>
                    Configure settings for this tenant
                  </CardDescription>
                </div>
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-4">Access & Authentication</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Single Sign-On (SSO)</h4>
                      <p className="text-xs text-muted-foreground">
                        Enable SSO authentication for tenant users
                      </p>
                    </div>
                    <div className="flex items-center h-6">
                      <input
                        type="checkbox"
                        defaultChecked={tenant.plan === "Enterprise"}
                        disabled={tenant.plan !== "Enterprise"}
                        className="h-4 w-4"
                        aria-label="Enable Single Sign-On"
                        id="sso-checkbox"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Multi-Factor Authentication</h4>
                      <p className="text-xs text-muted-foreground">
                        Require MFA for all tenant users
                      </p>
                    </div>
                    <div className="flex items-center h-6">
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        className="h-4 w-4"
                        aria-label="Enable Multi-Factor Authentication"
                        id="mfa-checkbox"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Domain Restriction</h4>
                      <p className="text-xs text-muted-foreground">
                        Restrict user signup to specific email domains
                      </p>
                    </div>
                    <div className="flex items-center h-6">
                      <input
                        type="checkbox"
                        defaultChecked={false}
                        className="h-4 w-4"
                        aria-label="Enable Domain Restriction"
                        id="domain-restriction-checkbox"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-4">Compliance & Security</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Audit Logging</h4>
                      <p className="text-xs text-muted-foreground">
                        Enable detailed audit logging for all actions
                      </p>
                    </div>
                    <div className="flex items-center h-6">
                      <input
                        type="checkbox"
                        defaultChecked={tenant.enabledFeatures.includes("Audit logging")}
                        className="h-4 w-4"
                        aria-label="Enable Audit Logging"
                        id="audit-logging-checkbox"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Data Encryption</h4>
                      <p className="text-xs text-muted-foreground">
                        Enable advanced data encryption
                      </p>
                    </div>
                    <div className="flex items-center h-6">
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        className="h-4 w-4"
                        aria-label="Enable Data Encryption"
                        id="data-encryption-checkbox"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">IP Restrictions</h4>
                      <p className="text-xs text-muted-foreground">
                        Restrict access to specific IP ranges
                      </p>
                    </div>
                    <div className="flex items-center h-6">
                      <input
                        type="checkbox"
                        defaultChecked={false}
                        disabled={tenant.plan !== "Enterprise"}
                        className="h-4 w-4"
                        aria-label="Enable IP Restrictions"
                        id="ip-restrictions-checkbox"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-4">API & Integration</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-sm font-medium">API Access</h4>
                      <Button variant="outline" size="sm">
                        <Copy className="mr-2 h-3 w-3" />
                        Copy API Key
                      </Button>
                    </div>
                    <div className="bg-muted rounded p-2 font-mono text-xs truncate">
                      sk_tenant_{tenant.slug}_xxxxxxxxxxxxxxxxxxxxx
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Webhook Notifications</h4>
                        <p className="text-xs text-muted-foreground">
                          Send webhook notifications for tenant events
                        </p>
                      </div>
                      <div className="flex items-center h-6">
                        <input
                          type="checkbox"
                          defaultChecked={tenant.plan !== "Standard"}
                          className="h-4 w-4"
                          aria-label="Enable Webhook Notifications"
                          id="webhook-notifications-checkbox"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">External Data Sources</h4>
                        <p className="text-xs text-muted-foreground">
                          Allow connection to external data sources
                        </p>
                      </div>
                      <div className="flex items-center h-6">
                        <input
                          type="checkbox"
                          defaultChecked={tenant.plan === "Enterprise"}
                          disabled={tenant.plan === "Standard"}
                          className="h-4 w-4"
                          aria-label="Enable External Data Sources"
                          id="external-data-sources-checkbox"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Delete Tenant
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete tenant "{tenant.name}"? This action cannot be undone
              and will remove all associated data, users, and configurations.
            </DialogDescription>
          </DialogHeader>
          <div className="border rounded-md p-3 bg-red-50 text-red-800 text-sm">
            <p className="font-medium">Warning: High-Impact Action</p>
            <p className="mt-1">
              This tenant has {tenant.usersCount} active users and {tenant.agentsCount} agents. 
              All user data and configurations will be permanently deleted.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTenant}>
              Delete Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}