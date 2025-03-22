"use client"

import { useState } from "react"
import {
  Plus,
  Search,
  Settings,
  RefreshCcw,
  Globe,
  Database,
  FileText,
  MoreHorizontal,
  CheckCircle2,
  AlertTriangle,
  Lock,
  UnlockKeyhole,
  Copy,
  Eye,
  EyeOff,
  ChevronRight,
  Key
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

// Sample integrations data
const integrations = [
  {
    id: "int-1",
    name: "CRM System",
    provider: "SalesForce",
    category: "crm",
    status: "active",
    lastSync: "2025-03-22T10:30:00Z",
    tenant: "tenant-1",
    description: "Integration with SalesForce CRM for customer data synchronization",
    icon: Globe
  },
  {
    id: "int-2",
    name: "Document Management",
    provider: "SharePoint",
    category: "document",
    status: "active",
    lastSync: "2025-03-21T16:45:00Z",
    tenant: "tenant-1",
    description: "Integration with SharePoint for document storage and retrieval",
    icon: FileText
  },
  {
    id: "int-3",
    name: "Database Connection",
    provider: "PostgreSQL",
    category: "database",
    status: "active",
    lastSync: "2025-03-22T08:15:00Z",
    tenant: "tenant-1",
    description: "Direct connection to company PostgreSQL database",
    icon: Database
  },
  {
    id: "int-4",
    name: "Marketing Platform",
    provider: "HubSpot",
    category: "marketing",
    status: "error",
    lastSync: "2025-03-20T14:30:00Z",
    tenant: "tenant-1",
    description: "Integration with HubSpot for marketing automation",
    icon: Globe
  },
  {
    id: "int-5",
    name: "Knowledge Base",
    provider: "Confluence",
    category: "knowledge",
    status: "pending",
    lastSync: null,
    tenant: "tenant-1",
    description: "Integration with Confluence for knowledge base access",
    icon: FileText
  }
]

// Sample API keys
const apiKeys = [
  {
    id: "key-1",
    name: "Production API Key",
    key: "sk_prod_2023_abcdefghijklmnopqrstuvwxyz",
    created: "2025-01-15T09:00:00Z",
    lastUsed: "2025-03-22T11:30:00Z",
    status: "active",
    scope: "full-access"
  },
  {
    id: "key-2",
    name: "Development API Key",
    key: "sk_dev_2023_zyxwvutsrqponmlkjihgfedcba",
    created: "2025-02-10T14:20:00Z",
    lastUsed: "2025-03-21T16:45:00Z",
    status: "active",
    scope: "read-only"
  },
  {
    id: "key-3",
    name: "Test Environment",
    key: "sk_test_2023_123456789abcdefghijklmnop",
    created: "2025-03-01T10:15:00Z",
    lastUsed: "2025-03-18T13:20:00Z",
    status: "active",
    scope: "test-only"
  }
]

// Sample integration providers
const integrationProviders = [
  { id: "salesforce", name: "Salesforce", category: "crm" },
  { id: "hubspot", name: "HubSpot", category: "marketing" },
  { id: "postgresql", name: "PostgreSQL", category: "database" },
  { id: "mysql", name: "MySQL", category: "database" },
  { id: "sharepoint", name: "SharePoint", category: "document" },
  { id: "confluence", name: "Confluence", category: "knowledge" },
  { id: "jira", name: "Jira", category: "project" },
  { id: "zendesk", name: "Zendesk", category: "support" },
  { id: "slack", name: "Slack", category: "communication" },
  { id: "microsoft-teams", name: "Microsoft Teams", category: "communication" }
]

export default function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showApiKey, setShowApiKey] = useState<{[key: string]: boolean}>({})
  const [newApiKeyName, setNewApiKeyName] = useState("")
  const [newApiKeyScope, setNewApiKeyScope] = useState("read-only")
  const [isCreateKeyDialogOpen, setIsCreateKeyDialogOpen] = useState(false)
  const [isAddIntegrationDialogOpen, setIsAddIntegrationDialogOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState("")
  const [isTestingIntegration, setIsTestingIntegration] = useState(false)

  // Filter integrations based on search query
  const filteredIntegrations = integrations.filter(integration => 
    integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    integration.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
    integration.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Toggle API key visibility
  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }))
  }

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Create new API key
  const handleCreateApiKey = () => {
    console.log("Creating new API key:", { name: newApiKeyName, scope: newApiKeyScope })
    // In a real app, this would make an API call to create a new key
    setIsCreateKeyDialogOpen(false)
    setNewApiKeyName("")
    // Would show a toast notification and refresh the key list
  }

  // Copy API key to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Would show a toast notification
    console.log("Copied to clipboard")
  }

  // Add new integration
  const handleAddIntegration = () => {
    console.log("Adding new integration for provider:", selectedProvider)
    // In a real app, this would start the OAuth flow or configuration process
    setIsAddIntegrationDialogOpen(false)
    setSelectedProvider("")
  }

  // Test integration
  const handleTestIntegration = (integrationId: string) => {
    setIsTestingIntegration(true)
    console.log("Testing integration:", integrationId)
    // In a real app, this would make an API call to test the integration
    setTimeout(() => {
      setIsTestingIntegration(false)
      // Would show a toast notification with the test result
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">API Integrations</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setIsCreateKeyDialogOpen(true)}
          >
            <Key className="mr-2 h-4 w-4" />
            New API Key
          </Button>
          <Button onClick={() => setIsAddIntegrationDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Integration
          </Button>
        </div>
      </div>

      <Tabs defaultValue="integrations">
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>External Integrations</CardTitle>
              <CardDescription>
                Manage connections to external systems and services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search integrations..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setSearchQuery("")}>
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                </div>
                
                {filteredIntegrations.length === 0 ? (
                  <div className="text-center py-12 border rounded-md">
                    <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Globe className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No integrations found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery 
                        ? "Try adjusting your search query" 
                        : "Get started by adding your first integration"}
                    </p>
                    {!searchQuery && (
                      <Button onClick={() => setIsAddIntegrationDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Integration
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredIntegrations.map((integration) => (
                      <Card key={integration.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <integration.icon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{integration.name}</CardTitle>
                                <CardDescription>{integration.provider}</CardDescription>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleTestIntegration(integration.id)}>
                                  <RefreshCcw className="mr-2 h-4 w-4" />
                                  <span>Test Connection</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Settings className="mr-2 h-4 w-4" />
                                  <span>Configure</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <AlertTriangle className="mr-2 h-4 w-4" />
                                  <span>Remove Integration</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Status:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(integration.status)}`}>
                                {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Last Sync:</span>
                              <span>{formatDate(integration.lastSync)}</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-1 border-t">
                          <Button variant="outline" size="sm" className="ml-auto" asChild>
                            <a href={`/dashboard/integrations/${integration.id}`}>
                              View Details
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </a>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api-keys">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage API keys for programmatic access to the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Your API Keys</h3>
                  <Button size="sm" onClick={() => setIsCreateKeyDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Key
                  </Button>
                </div>
                
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{apiKey.name}</h4>
                        <p className="text-xs text-muted-foreground">Created: {formatDate(apiKey.created)}</p>
                      </div>
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          {apiKey.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="relative flex-1">
                        <Input 
                          value={showApiKey[apiKey.id] ? apiKey.key : "•".repeat(apiKey.key.length)}
                          readOnly
                          className="pr-20 font-mono"
                        />
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex">
                          <Button variant="ghost" size="icon" onClick={() => toggleApiKeyVisibility(apiKey.id)}>
                            {showApiKey[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => copyToClipboard(apiKey.key)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Scope:</span>
                        <span>{apiKey.scope}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Last Used:</span>
                        <span>{formatDate(apiKey.lastUsed)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="text-sm mt-4">
                  <h4 className="font-medium mb-2">API Key Security</h4>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Keep your API keys secure; they have access to your account</li>
                    <li>Never share API keys in public repositories or client-side code</li>
                    <li>Rotate keys periodically to enhance security</li>
                    <li>Use scoped keys with minimal permissions required for a specific task</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>
                Configure global settings for all integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Authentication</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">OAuth Auto-Renewal</h4>
                        <p className="text-sm text-muted-foreground">Automatically renew OAuth tokens before they expire</p>
                      </div>
                      <div className="flex items-center h-6">
                        <input type="checkbox" id="oauth-renewal" className="h-4 w-4" defaultChecked />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">API Key Access Logging</h4>
                        <p className="text-sm text-muted-foreground">Log all API key usage for security monitoring</p>
                      </div>
                      <div className="flex items-center h-6">
                        <input type="checkbox" id="api-logging" className="h-4 w-4" defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Data Synchronization</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Default Sync Schedule</label>
                        <Select defaultValue="hourly">
                          <SelectTrigger>
                            <SelectValue placeholder="Select schedule" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="realtime">Real-time</SelectItem>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="manual">Manual Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Sync Conflict Resolution</label>
                        <Select defaultValue="newest">
                          <SelectTrigger>
                            <SelectValue placeholder="Select resolution strategy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">Newest Wins</SelectItem>
                            <SelectItem value="tenant">Tenant System Wins</SelectItem>
                            <SelectItem value="external">External System Wins</SelectItem>
                            <SelectItem value="manual">Manual Resolution</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Automatic Retry on Failure</h4>
                        <p className="text-sm text-muted-foreground">Automatically retry failed synchronization attempts</p>
                      </div>
                      <div className="flex items-center h-6">
                        <input type="checkbox" id="auto-retry" className="h-4 w-4" defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Rate Limiting</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Default API Request Limit</label>
                        <Select defaultValue="1000">
                          <SelectTrigger>
                            <SelectValue placeholder="Select limit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="100">100 requests/minute</SelectItem>
                            <SelectItem value="500">500 requests/minute</SelectItem>
                            <SelectItem value="1000">1,000 requests/minute</SelectItem>
                            <SelectItem value="5000">5,000 requests/minute</SelectItem>
                            <SelectItem value="unlimited">Unlimited</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Rate Limit Behavior</label>
                        <Select defaultValue="queue">
                          <SelectTrigger>
                            <SelectValue placeholder="Select behavior" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="queue">Queue Requests</SelectItem>
                            <SelectItem value="reject">Reject Requests</SelectItem>
                            <SelectItem value="throttle">Throttle</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t p-4">
              <Button variant="outline">Reset to Defaults</Button>
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create API Key Dialog */}
      <Dialog open={isCreateKeyDialogOpen} onOpenChange={setIsCreateKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>
              Generate a new API key for programmatic access to the platform. Keep this key secure.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">API Key Name</Label>
              <Input 
                id="key-name" 
                placeholder="e.g., Production Backend" 
                value={newApiKeyName}
                onChange={(e) => setNewApiKeyName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Give your key a descriptive name to help you identify it later
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="key-scope">Key Scope</Label>
              <Select value={newApiKeyScope} onValueChange={setNewApiKeyScope}>
                <SelectTrigger id="key-scope">
                  <SelectValue placeholder="Select permission scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-access">
                    Full Access (read/write all data)
                  </SelectItem>
                  <SelectItem value="read-only">
                    Read-Only (no modifications)
                  </SelectItem>
                  <SelectItem value="test-only">
                    Test Environment Only
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Limit this key's capabilities to only what's necessary
              </p>
            </div>
            <div className="flex items-center border-t border-b py-3 my-2">
              <Lock className="h-4 w-4 mr-2 text-amber-500" />
              <p className="text-sm text-muted-foreground">
                API keys have full access according to their scope. Keep them secure.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateKeyDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateApiKey} 
              disabled={!newApiKeyName.trim()}
            >
              Create API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Integration Dialog */}
      <Dialog open={isAddIntegrationDialogOpen} onOpenChange={setIsAddIntegrationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Integration</DialogTitle>
            <DialogDescription>
              Connect your tenant to an external service or data source
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Integration Provider</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger id="provider">
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Select a provider</SelectItem>
                  {integrationProviders.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedProvider && (
              <div className="p-4 bg-muted rounded-md">
                <h4 className="font-medium mb-2">
                  {integrationProviders.find(p => p.id === selectedProvider)?.name} Integration
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  This will start the configuration process for connecting to
                  {" " + integrationProviders.find(p => p.id === selectedProvider)?.name}.
                  You'll need to provide authentication details in the next steps.
                </p>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  <span>Compatible with your current plan</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddIntegrationDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddIntegration} 
              disabled={!selectedProvider}
            >
              Continue Setup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}