"use client"

import { useState } from "react"
import { 
  Filter, 
  Download, 
  RefreshCcw, 
  Calendar, 
  User, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Info,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Sample audit logs
const auditLogs = [
  {
    id: "log-1",
    timestamp: "2025-03-22T14:32:15Z",
    activity: "User login",
    user: "john.doe@example.com",
    tenantId: "tenant-1",
    ipAddress: "192.168.1.1",
    details: "Successful login via password",
    category: "authentication",
    severity: "info"
  },
  {
    id: "log-2",
    timestamp: "2025-03-22T13:45:22Z",
    activity: "Password change",
    user: "jane.smith@example.com",
    tenantId: "tenant-1",
    ipAddress: "192.168.1.2",
    details: "User changed their password",
    category: "account",
    severity: "info"
  },
  {
    id: "log-3",
    timestamp: "2025-03-22T12:30:05Z",
    activity: "Permission change",
    user: "admin@example.com",
    tenantId: "tenant-1",
    ipAddress: "192.168.1.3",
    details: "Admin granted 'manage-users' permission to jane.smith@example.com",
    category: "permissions",
    severity: "warning"
  },
  {
    id: "log-4",
    timestamp: "2025-03-22T11:20:18Z",
    activity: "Failed login attempt",
    user: "john.doe@example.com",
    tenantId: "tenant-1",
    ipAddress: "203.0.113.42",
    details: "5 consecutive failed login attempts",
    category: "authentication",
    severity: "critical"
  },
  {
    id: "log-5",
    timestamp: "2025-03-22T10:15:30Z",
    activity: "API key created",
    user: "api.admin@example.com",
    tenantId: "tenant-1",
    ipAddress: "192.168.1.5",
    details: "New API key created with read-write access",
    category: "api",
    severity: "warning"
  },
  {
    id: "log-6",
    timestamp: "2025-03-22T09:05:12Z",
    activity: "Document access",
    user: "jane.smith@example.com",
    tenantId: "tenant-1",
    ipAddress: "192.168.1.2",
    details: "Accessed sensitive financial document FIN-2025-Q1",
    category: "data-access",
    severity: "info"
  },
  {
    id: "log-7",
    timestamp: "2025-03-22T08:45:29Z",
    activity: "Agent configuration",
    user: "admin@example.com",
    tenantId: "tenant-1",
    ipAddress: "192.168.1.3",
    details: "Modified AI agent 'customer-support' personality settings",
    category: "configuration",
    severity: "info"
  },
  {
    id: "log-8",
    timestamp: "2025-03-21T23:10:45Z",
    activity: "System update",
    user: "system",
    tenantId: "system",
    ipAddress: "127.0.0.1",
    details: "Scheduled system maintenance completed",
    category: "system",
    severity: "info"
  },
  {
    id: "log-9",
    timestamp: "2025-03-21T22:30:15Z",
    activity: "Unauthorized API access",
    user: "unknown",
    tenantId: "tenant-2",
    ipAddress: "198.51.100.67",
    details: "Attempted access with revoked API key",
    category: "api",
    severity: "critical"
  },
  {
    id: "log-10",
    timestamp: "2025-03-21T21:20:18Z",
    activity: "User account locked",
    user: "robert.johnson@example.com",
    tenantId: "tenant-2",
    ipAddress: "192.168.2.5",
    details: "Account locked after multiple failed login attempts",
    category: "authentication",
    severity: "warning"
  },
]

// Define filter options
const categories = [
  { value: "all", label: "All Categories" },
  { value: "authentication", label: "Authentication" },
  { value: "account", label: "Account Changes" },
  { value: "permissions", label: "Permissions" },
  { value: "api", label: "API Activities" },
  { value: "data-access", label: "Data Access" },
  { value: "configuration", label: "Configuration" },
  { value: "system", label: "System Events" },
]

const severities = [
  { value: "all", label: "All Severities" },
  { value: "info", label: "Information" },
  { value: "warning", label: "Warning" },
  { value: "critical", label: "Critical" },
]

const tenants = [
  { value: "all", label: "All Tenants" },
  { value: "tenant-1", label: "Enterprise Corp" },
  { value: "tenant-2", label: "Innovate Inc" },
  { value: "system", label: "System" },
]

const timeRanges = [
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "custom", label: "Custom Range" },
]

export default function AuditLoggingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedSeverity, setSelectedSeverity] = useState("all")
  const [selectedTenant, setSelectedTenant] = useState("all")
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h")
  const [isExporting, setIsExporting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Filter logs based on selected filters
  const filteredLogs = auditLogs.filter(log => {
    // Search query filter
    if (searchQuery && 
        !log.activity.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !log.user.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !log.details.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    // Category filter
    if (selectedCategory !== "all" && log.category !== selectedCategory) {
      return false
    }
    
    // Severity filter
    if (selectedSeverity !== "all" && log.severity !== selectedSeverity) {
      return false
    }
    
    // Tenant filter
    if (selectedTenant !== "all" && log.tenantId !== selectedTenant) {
      return false
    }
    
    // For demo purposes, we'll skip actual date filtering but would implement in production
    
    return true
  })

  // Handle export
  const handleExport = () => {
    setIsExporting(true)
    // In a real application, this would trigger a download of the filtered logs
    setTimeout(() => {
      setIsExporting(false)
      // Would trigger a toast notification in a real app
      console.log("Logs exported successfully")
    }, 1500)
  }

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    // In a real application, this would fetch the latest logs
    setTimeout(() => {
      setIsRefreshing(false)
      // Would trigger a toast notification in a real app
      console.log("Logs refreshed successfully")
    }, 1500)
  }

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "info":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Audit Logging</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export Logs"}
          </Button>
          <Button 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="logs">
        <TabsList>
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Security Audit Logs</CardTitle>
              <CardDescription>
                Track and monitor all security-related activities across your tenants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Filter className="mr-2 h-4 w-4" />
                          Filters
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <h4 className="font-medium">Category</h4>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category.value} value={category.value}>
                                    {category.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-medium">Severity</h4>
                            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select severity" />
                              </SelectTrigger>
                              <SelectContent>
                                {severities.map((severity) => (
                                  <SelectItem key={severity.value} value={severity.value}>
                                    {severity.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-medium">Tenant</h4>
                            <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select tenant" />
                              </SelectTrigger>
                              <SelectContent>
                                {tenants.map((tenant) => (
                                  <SelectItem key={tenant.value} value={tenant.value}>
                                    {tenant.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-medium">Time Range</h4>
                            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time range" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeRanges.map((range) => (
                                  <SelectItem key={range.value} value={range.value}>
                                    {range.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex justify-between">
                            <Button variant="outline" size="sm" onClick={() => {
                              setSelectedCategory("all")
                              setSelectedSeverity("all")
                              setSelectedTenant("all")
                              setSelectedTimeRange("24h")
                            }}>
                              Reset Filters
                            </Button>
                            <Button size="sm">Apply Filters</Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    
                    {selectedCategory !== "all" && (
                      <Button variant="outline" size="sm" onClick={() => setSelectedCategory("all")}>
                        Category: {categories.find(c => c.value === selectedCategory)?.label}
                        <span className="ml-1 text-xs">×</span>
                      </Button>
                    )}
                    
                    {selectedSeverity !== "all" && (
                      <Button variant="outline" size="sm" onClick={() => setSelectedSeverity("all")}>
                        Severity: {severities.find(s => s.value === selectedSeverity)?.label}
                        <span className="ml-1 text-xs">×</span>
                      </Button>
                    )}
                    
                    {selectedTenant !== "all" && (
                      <Button variant="outline" size="sm" onClick={() => setSelectedTenant("all")}>
                        Tenant: {tenants.find(t => t.value === selectedTenant)?.label}
                        <span className="ml-1 text-xs">×</span>
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead className="w-[180px]">Timestamp</TableHead>
                        <TableHead>Activity</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Tenant</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead className="w-[100px]">Category</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No audit logs found matching your criteria.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLogs.map((log) => (
                          <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50">
                            <TableCell>
                              {getSeverityIcon(log.severity)}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {formatDate(log.timestamp)}
                            </TableCell>
                            <TableCell>
                              <div>{log.activity}</div>
                              <div className="text-xs text-muted-foreground">{log.details}</div>
                            </TableCell>
                            <TableCell>{log.user}</TableCell>
                            <TableCell>
                              {tenants.find(t => t.value === log.tenantId)?.label || log.tenantId}
                            </TableCell>
                            <TableCell className="font-mono text-xs">{log.ipAddress}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityBadgeClass(log.severity)}`}>
                                {log.category}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <div className="text-sm text-muted-foreground">
                Showing {filteredLogs.length} of {auditLogs.length} logs
              </div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="visualizations">
          <Card>
            <CardHeader>
              <CardTitle>Security Analytics</CardTitle>
              <CardDescription>
                Visualize security events and identify patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Event Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                      <div className="text-center">
                        <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Event distribution chart visualization would appear here
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Severity Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                      <div className="text-center">
                        <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Severity breakdown chart visualization would appear here
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Security Events Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                      <div className="text-center">
                        <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Security events timeline visualization would appear here
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logging Settings</CardTitle>
              <CardDescription>
                Configure audit log retention and notification policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Log Retention</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Critical Events Retention</label>
                        <Select defaultValue="365">
                          <SelectTrigger>
                            <SelectValue placeholder="Select retention period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="90">90 days</SelectItem>
                            <SelectItem value="180">180 days</SelectItem>
                            <SelectItem value="365">365 days</SelectItem>
                            <SelectItem value="730">730 days</SelectItem>
                            <SelectItem value="1825">5 years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Standard Events Retention</label>
                        <Select defaultValue="90">
                          <SelectTrigger>
                            <SelectValue placeholder="Select retention period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 days</SelectItem>
                            <SelectItem value="60">60 days</SelectItem>
                            <SelectItem value="90">90 days</SelectItem>
                            <SelectItem value="180">180 days</SelectItem>
                            <SelectItem value="365">365 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Alert Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Critical Event Alerts</h4>
                        <p className="text-sm text-muted-foreground">Send immediate email alerts for critical security events</p>
                      </div>
                      <div className="flex items-center h-6">
                        <input type="checkbox" id="critical-alerts" className="h-4 w-4" defaultChecked />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Warning Event Alerts</h4>
                        <p className="text-sm text-muted-foreground">Send email digest for warning-level security events</p>
                      </div>
                      <div className="flex items-center h-6">
                        <input type="checkbox" id="warning-alerts" className="h-4 w-4" defaultChecked />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Failed Authentication Alerts</h4>
                        <p className="text-sm text-muted-foreground">Send alerts for repeated failed authentication attempts</p>
                      </div>
                      <div className="flex items-center h-6">
                        <input type="checkbox" id="auth-alerts" className="h-4 w-4" defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t p-4">
              <Button variant="outline">Cancel</Button>
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}