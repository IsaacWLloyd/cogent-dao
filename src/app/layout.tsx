import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import "./globals.css";

import { AuthHeader } from "@/src/components/auth-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cogent DAO",
  description: "A Next.js application with Supabase authentication",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
  
  const { data: { session } } = await supabase.auth.getSession();
  const isSignedIn = !!session;

  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground flex flex-col min-h-screen`}
      >
        <AuthHeader isSignedIn={isSignedIn} />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
