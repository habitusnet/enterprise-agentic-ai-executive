import { Metadata } from "next";
import Image from "next/image";
import { AuthCard } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/signin-form";

export const metadata: Metadata = {
  title: "Sign In | Tenant Administration",
  description: "Sign in to your account",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center mb-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            Tenant Administration
          </h1>
          <p className="text-sm text-muted-foreground">
            Enterprise Agentic AI Executive
          </p>
        </div>
        <AuthCard
          title="Sign In"
          description="Enter your credentials to access your account"
        >
          <SignInForm />
        </AuthCard>
      </div>
    </div>
  );
}