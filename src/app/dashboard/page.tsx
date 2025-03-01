import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { DaoClientWrapper } from '@/src/components/dao/dao-client-wrapper';

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/signin');
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 bg-card p-6 rounded-lg shadow-sm border border-border">
        <h2 className="text-xl font-semibold mb-2">Welcome to Cogent DAO</h2>
        <p className="text-muted-foreground">
          You are signed in as: {user?.email || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Anonymous User'}
        </p>
      </div>
      
      <DaoClientWrapper userId={user?.id || ''} />
    </div>
  );
}
