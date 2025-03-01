import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase Server Client for server components
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
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
}

/**
 * Ensures a user exists in the 'users' table after authentication
 * Creates a new user record if one doesn't exist
 */
export async function ensureUserExists(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
  userData: {
    email?: string;
    username?: string;
  }
) {
  // Check if user already exists
  const { data: existingUser, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (userError || !existingUser) {
    // User doesn't exist, create new record
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        username: userData.username,
        email: userData.email,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error creating user record:', insertError.message);
      throw insertError;
    }
    
    return false; // New user created
  }
  
  return true; // User already existed
}
