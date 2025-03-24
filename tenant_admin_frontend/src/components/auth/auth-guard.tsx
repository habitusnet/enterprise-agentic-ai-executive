"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-utils";

export interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

/**
 * Client-side authentication guard component
 * Redirects to login page if user is not authenticated
 * Can optionally check for specific roles
 */
export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're not loading and the user isn't authenticated
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }

    // If a specific role is required, check for it
    if (
      !isLoading &&
      isAuthenticated &&
      requiredRole &&
      role !== requiredRole &&
      role !== "admin" // Admin can access everything
    ) {
      router.push("/dashboard"); // Redirect to dashboard if user doesn't have required role
    }
  }, [isAuthenticated, isLoading, requiredRole, role, router]);

  // Show nothing while loading
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // If not authenticated, show nothing (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // If role check fails, show nothing (will redirect)
  if (requiredRole && role !== requiredRole && role !== "admin") {
    return null;
  }

  // Otherwise, render children
  return <>{children}</>;
}