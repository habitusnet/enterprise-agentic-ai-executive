"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export default function Home() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Mock authentication - in a real app, this would call an auth API
    setTimeout(() => {
      setLoading(false)
      toast({
        title: "Authentication successful",
        description: "Redirecting to the dashboard...",
      })
      router.push("/dashboard")
    }, 1500)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted/50">
      <div className="w-full max-w-md p-6">
        <div className="flex flex-col space-y-2 text-center mb-8">
          <h1 className="text-3xl font-bold">Tenant Administration</h1>
          <p className="text-muted-foreground">Enterprise Agentic AI Executive</p>
        </div>

        <Card>
          <form onSubmit={handleLogin}>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Access your tenant administration dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="admin@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              <div className="text-sm text-center text-muted-foreground mt-2">
                <Link href="/forgot-password" className="hover:underline">
                  Forgot password?
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}