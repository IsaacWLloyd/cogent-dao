import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
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
  
  if (!session) {
    redirect('/signin');
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
        <h2 className="text-xl font-semibold mb-4">Welcome to your dashboard</h2>
        <p className="text-muted-foreground mb-4">
          You are signed in as: {user?.email || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Anonymous User'}
        </p>
        <p className="text-muted-foreground">
          Provider: {user?.app_metadata?.provider || 'Unknown'}
        </p>
      </div>
    </div>
  );
}