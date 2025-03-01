"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { supabase } from "@/src/lib/supabase";
import { Button } from "@/src/components/ui/button";

export function Header() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      router.push("/signin");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <header className="w-full border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/dashboard" className="font-semibold text-xl flex items-center">
          <span className="text-primary mr-2">Cogent</span>
          <span>DAO</span>
        </Link>
        <div className="flex items-center gap-4">
          <Button 
            variant="destructive" 
            onClick={handleSignOut}
            disabled={isLoading}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}