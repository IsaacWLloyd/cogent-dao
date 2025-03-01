import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { getUserFromRequest, errorResponse } from '@/src/lib/api-utils';
import { Proposal } from '@/src/lib/types';

// Get all active proposals
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }
    
    // Connect to Supabase
    const supabase = await createServerSupabaseClient();
    
    // Get all active proposals
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching active proposals:', error);
      return errorResponse(500, 'Failed to fetch active proposals');
    }
    
    return NextResponse.json(data as Proposal[], { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return errorResponse(500, 'An unexpected error occurred');
  }
}