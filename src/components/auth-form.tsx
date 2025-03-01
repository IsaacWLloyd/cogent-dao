"use client";

import { Github, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { supabase } from "@/src/lib/supabase";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Separator } from "@/src/components/ui/separator";

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  mode?: "signin" | "signup";
}

export function AuthForm({
  className,
  mode = "signin",
  ...props
}: AuthFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  async function signInWithGithub() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: false,
        },
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error signing in with GitHub:", error);
      setIsLoading(false);
    }
    // Note: We don't set isLoading to false here since we're redirecting
  }

  async function signInWithGoogle() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: false,
        },
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setIsLoading(false);
    }
    // Note: We don't set isLoading to false here since we're redirecting
  }

  return (
    <div className={cn("grid gap-6 w-full", className)} {...props}>
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">
          {mode === "signin" ? "Sign In" : "Create an account"}
        </h1>
        <p className="text-sm text-muted-foreground mb-4">
          {mode === "signin"
            ? "Sign in to your account using a social provider"
            : "Create an account using a social provider"}
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid grid-cols-1 gap-4">
          <Button
            className="h-12 px-6 border-muted-foreground/30 hover:bg-secondary"
            variant="outline"
            disabled={isLoading}
            onClick={signInWithGithub}
          >
            <Github className="mr-3 h-5 w-5" />
            Continue with GitHub
          </Button>
          <Button
            className="h-12 px-6 border-muted-foreground/30 hover:bg-secondary"
            variant="outline"
            disabled={isLoading}
            onClick={signInWithGoogle}
          >
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Continue with Google
          </Button>
        </div>
      </div>
      <div className="mt-6 text-center text-sm">
        {mode === "signin" ? (
          <>
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium underline underline-offset-4 hover:text-primary"
            >
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-medium underline underline-offset-4 hover:text-primary"
            >
              Sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}