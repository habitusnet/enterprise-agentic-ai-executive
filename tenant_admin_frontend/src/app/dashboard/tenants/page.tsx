"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  AlertCircle,
  UserCheck,
  Settings,
  RefreshCcw
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

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
    createdAt: "2024-03-15",
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
    createdAt: "2024-04-02",
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
    createdAt: "2024-04-18",
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
    createdAt: "2024-01-20",
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
    createdAt: "2024-02-11",
  },
]

export default function TenantsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTenant, setSelectedTenant] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const filteredTenants = tenants.filter(tenant => 
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDeleteTenant = () => {
    // In a real app, this would make an API call
    console.log("Deleting tenant:", selectedTenant?.id)
    setIsDeleteDialogOpen(false)
    // Would then refetch tenants
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tenant Management</h1>
        <Button asChild>
          <Link href="/dashboard/tenants/create">
            <Plus className="mr-2 h-4 w-4" /> Add Tenant
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tenants Overview</CardTitle>
          <CardDescription>Manage your enterprise tenants and their configurations.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tenants..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={() => setSearchQuery("")}>
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Agents</TableHead>
                  <TableHead>API Usage</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No tenants found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">
                        <Link href={`/dashboard/tenants/${tenant.id}`} className="hover:underline">
                          {tenant.name}
                        </Link>
                        <div className="text-xs text-muted-foreground">{tenant.slug}</div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getStatusBadgeClass(tenant.status)}`}>
                          {tenant.status === "active" ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                          ) : tenant.status === "pending" ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500"></span>
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                          )}
                          {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>{tenant.plan}</TableCell>
                      <TableCell>{tenant.usersCount}</TableCell>
                      <TableCell>{tenant.agentsCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-100 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${
                                parseInt(tenant.apiUsage) > 80 ? 'bg-red-500' :
                                parseInt(tenant.apiUsage) > 60 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: tenant.apiUsage }}
                            ></div>
                          </div>
                          <span>{tenant.apiUsage}</span>
                        </div>
                      </TableCell>
                      <TableCell>{tenant.createdAt}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/tenants/${tenant.id}`}>
                                <UserCheck className="mr-2 h-4 w-4" />
                                <span>View Details</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/tenants/${tenant.id}/edit`}>
                                <Edit2 className="mr-2 h-4 w-4" />
                                <span>Edit Tenant</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/tenants/${tenant.id}/settings`}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                setSelectedTenant(tenant)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredTenants.length} of {tenants.length} tenants
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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Delete Tenant
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete tenant "{selectedTenant?.name}"? This action cannot be undone
              and will remove all associated data, users, and configurations.
            </DialogDescription>
          </DialogHeader>
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