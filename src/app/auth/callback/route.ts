import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, ensureUserExists } from '@/src/lib/supabase-server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const accessToken = requestUrl.hash ? requestUrl.hash.substring(1).split('&').find(param => param.startsWith('access_token='))?.split('=')[1] : null;
  
  // Get the Supabase client
  const supabase = await createServerSupabaseClient();
  
  // If code exists, exchange it
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }
  
  // Check if we have a session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    // If no session, try to sign in with access token if present
    if (accessToken) {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '',
      });
      
      if (error) {
        console.error('Error setting session:', error.message);
      }
    }
  } else {
    // We have a session, ensure user exists in our users table
    try {
      // Derive username from user metadata or email
      const username = 
        session.user.user_metadata.preferred_username || 
        session.user.user_metadata.name || 
        session.user.email?.split('@')[0] || 
        `user_${session.user.id.substring(0, 8)}`;
        
      await ensureUserExists(supabase, session.user.id, {
        username,
        email: session.user.email
      });
    } catch (error) {
      console.error('Error ensuring user exists:', error);
    }
  }
  
  // Redirect to dashboard
  return NextResponse.redirect(new URL('/dashboard', request.url));
}