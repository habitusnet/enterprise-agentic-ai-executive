"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft,
  Save,
  Building,
  User,
  Briefcase,
  Globe,
  Mail,
  Phone,
  UserCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function CreateTenantPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    plan: "standard",
    status: "active",
    description: "",
    // Contact information
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    // Organization details
    industry: "",
    size: "small",
    website: "",
    address: "",
    // Settings
    maxUsers: "50",
    maxAgents: "5",
    allowCustomAgents: true,
    enableAuditLogging: true,
    dataRetentionDays: "90"
  })
  
  // Generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData({
      ...formData,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    })
  }
  
  // Handle other form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }
  
  // Handle select field changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    })
  }
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // In a real app, this would be an API call to create the tenant
    setTimeout(() => {
      setIsSubmitting(false)
      console.log("Tenant created:", formData)
      
      // Navigate back to tenant list
      router.push("/dashboard/tenants")
    }, 1500)
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
          <h1 className="text-3xl font-bold">Create New Tenant</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/tenants">Cancel</Link>
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.name || !formData.slug}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Creating..." : "Create Tenant"}
          </Button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tenant Information</CardTitle>
                <CardDescription>
                  Enter basic information about the new tenant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tenant Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enterprise Corporation"
                      value={formData.name}
                      onChange={handleNameChange}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      The full name of the tenant organization
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Tenant Slug <span className="text-red-500">*</span></Label>
                    <Input
                      id="slug"
                      name="slug"
                      placeholder="enterprise-corporation"
                      value={formData.slug}
                      onChange={handleChange}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Used in URLs and API references (no spaces or special characters)
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plan">Subscription Plan</Label>
                    <Select
                      value={formData.plan}
                      onValueChange={(value) => handleSelectChange("plan", value)}
                    >
                      <SelectTrigger id="plan">
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                        <SelectItem value="trial">Trial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Initial Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleSelectChange("status", value)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Brief description of the tenant organization"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="contact" className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="contact">Contact Information</TabsTrigger>
                <TabsTrigger value="organization">Organization Details</TabsTrigger>
                <TabsTrigger value="settings">Tenant Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="contact" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Primary Contact</CardTitle>
                    <CardDescription>
                      Contact information for the tenant administrator
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactName">Contact Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="contactName"
                            name="contactName"
                            placeholder="John Doe"
                            value={formData.contactName}
                            onChange={handleChange}
                            className="pl-9"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="contactEmail"
                            name="contactEmail"
                            type="email"
                            placeholder="john.doe@example.com"
                            value={formData.contactEmail}
                            onChange={handleChange}
                            className="pl-9"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="contactPhone"
                          name="contactPhone"
                          placeholder="+1 (555) 123-4567"
                          value={formData.contactPhone}
                          onChange={handleChange}
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="organization" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Organization Information</CardTitle>
                    <CardDescription>
                      Additional details about the tenant organization
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Select
                          value={formData.industry}
                          onValueChange={(value) => handleSelectChange("industry", value)}
                        >
                          <SelectTrigger id="industry">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="government">Government</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="size">Organization Size</Label>
                        <Select
                          value={formData.size}
                          onValueChange={(value) => handleSelectChange("size", value)}
                        >
                          <SelectTrigger id="size">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small (1-50 employees)</SelectItem>
                            <SelectItem value="medium">Medium (51-500 employees)</SelectItem>
                            <SelectItem value="large">Large (501-5000 employees)</SelectItem>
                            <SelectItem value="enterprise">Enterprise (5000+ employees)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="website"
                          name="website"
                          placeholder="https://example.com"
                          value={formData.website}
                          onChange={handleChange}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        name="address"
                        placeholder="123 Main St, City, State, Country"
                        value={formData.address}
                        onChange={handleChange}
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Tenant Settings</CardTitle>
                    <CardDescription>
                      Configure service limits and settings for this tenant
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="limits">
                        <AccordionTrigger>Resource Limits</AccordionTrigger>
                        <AccordionContent className="pt-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="maxUsers">Maximum Users</Label>
                              <Select
                                value={formData.maxUsers}
                                onValueChange={(value) => handleSelectChange("maxUsers", value)}
                              >
                                <SelectTrigger id="maxUsers">
                                  <SelectValue placeholder="Select limit" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="10">10 users</SelectItem>
                                  <SelectItem value="50">50 users</SelectItem>
                                  <SelectItem value="100">100 users</SelectItem>
                                  <SelectItem value="500">500 users</SelectItem>
                                  <SelectItem value="unlimited">Unlimited</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="maxAgents">Maximum AI Agents</Label>
                              <Select
                                value={formData.maxAgents}
                                onValueChange={(value) => handleSelectChange("maxAgents", value)}
                              >
                                <SelectTrigger id="maxAgents">
                                  <SelectValue placeholder="Select limit" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="3">3 agents</SelectItem>
                                  <SelectItem value="5">5 agents</SelectItem>
                                  <SelectItem value="10">10 agents</SelectItem>
                                  <SelectItem value="20">20 agents</SelectItem>
                                  <SelectItem value="unlimited">Unlimited</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="dataRetention">
                        <AccordionTrigger>Data Retention</AccordionTrigger>
                        <AccordionContent className="pt-4 space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="dataRetentionDays">Data Retention Period</Label>
                            <Select
                              value={formData.dataRetentionDays}
                              onValueChange={(value) => handleSelectChange("dataRetentionDays", value)}
                            >
                              <SelectTrigger id="dataRetentionDays">
                                <SelectValue placeholder="Select period" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="30">30 days</SelectItem>
                                <SelectItem value="60">60 days</SelectItem>
                                <SelectItem value="90">90 days</SelectItem>
                                <SelectItem value="180">180 days</SelectItem>
                                <SelectItem value="365">365 days</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                              How long to retain logs, events, and other activity data
                            </p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="features">
                        <AccordionTrigger>Feature Access</AccordionTrigger>
                        <AccordionContent className="pt-4 space-y-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="allowCustomAgents"
                              checked={formData.allowCustomAgents}
                              onChange={() => setFormData({
                                ...formData,
                                allowCustomAgents: !formData.allowCustomAgents
                              })}
                              className="h-4 w-4"
                            />
                            <label
                              htmlFor="allowCustomAgents"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Allow Custom Agent Creation
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="enableAuditLogging"
                              checked={formData.enableAuditLogging}
                              onChange={() => setFormData({
                                ...formData,
                                enableAuditLogging: !formData.enableAuditLogging
                              })}
                              className="h-4 w-4"
                            />
                            <label
                              htmlFor="enableAuditLogging"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Enable Detailed Audit Logging
                            </label>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tenant Preview</CardTitle>
                <CardDescription>
                  Summary of the tenant configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{formData.name || "New Tenant"}</h3>
                      <p className="text-sm text-muted-foreground">{formData.slug || "tenant-slug"}</p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="text-sm">
                      <span className="font-medium">Plan: </span>
                      <span className="capitalize">{formData.plan}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Status: </span>
                      <span className={`capitalize ${
                        formData.status === "active" ? "text-green-600" :
                        formData.status === "pending" ? "text-amber-600" :
                        "text-red-600"
                      }`}>
                        {formData.status}
                      </span>
                    </div>
                    {formData.contactName && (
                      <div className="text-sm">
                        <span className="font-medium">Contact: </span>
                        <span>{formData.contactName}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-2">Plan Features</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start text-sm">
                      <UserCheck className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <span>
                        <span className="font-medium">
                          {formData.maxUsers === "unlimited" ? "Unlimited" : formData.maxUsers}
                        </span> user accounts
                      </span>
                    </li>
                    <li className="flex items-start text-sm">
                      <UserCheck className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <span>
                        <span className="font-medium">
                          {formData.maxAgents === "unlimited" ? "Unlimited" : formData.maxAgents}
                        </span> AI agents
                      </span>
                    </li>
                    <li className="flex items-start text-sm">
                      <UserCheck className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                      <span>
                        <span className="font-medium">
                          {formData.dataRetentionDays}
                        </span> days data retention
                      </span>
                    </li>
                    {formData.allowCustomAgents && (
                      <li className="flex items-start text-sm">
                        <UserCheck className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                        <span>Custom agent creation</span>
                      </li>
                    )}
                    {formData.enableAuditLogging && (
                      <li className="flex items-start text-sm">
                        <UserCheck className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                        <span>Detailed audit logging</span>
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button 
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.name || !formData.slug}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Creating..." : "Create Tenant"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}