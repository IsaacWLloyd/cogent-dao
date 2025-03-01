import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { getUserFromRequest, errorResponse } from '@/src/lib/api-utils';
import { Proposal } from '@/src/lib/types';

// Get the user's proposals
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }
    
    // Connect to Supabase
    const supabase = await createServerSupabaseClient();
    
    // Get user's proposals
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user proposals:', error);
      return errorResponse(500, 'Failed to fetch your proposals');
    }
    
    return NextResponse.json(data as Proposal[], { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return errorResponse(500, 'An unexpected error occurred');
  }
}