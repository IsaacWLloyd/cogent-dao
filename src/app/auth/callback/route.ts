import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const accessToken = requestUrl.hash ? requestUrl.hash.substring(1).split('&').find(param => param.startsWith('access_token='))?.split('=')[1] : null;
  
  const cookieStore = cookies();
  
  // Create server client with cookies
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
  }
  
  // Redirect to dashboard
  return NextResponse.redirect(new URL('/dashboard', request.url));
}