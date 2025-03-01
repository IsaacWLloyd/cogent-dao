import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/src/lib/supabase-server';

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  
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
