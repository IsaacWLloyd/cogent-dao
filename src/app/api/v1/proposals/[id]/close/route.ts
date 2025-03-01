import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { getUserFromRequest, errorResponse, getProposalWithOwnerCheck } from '@/src/lib/api-utils';
import { Proposal } from '@/src/lib/types';

// Close an active proposal
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    const proposalId = params.id;
    
    // Connect to Supabase
    const supabase = await createServerSupabaseClient();
    
    // Check proposal exists, user is owner, and proposal is open
    const { error, status } = await getProposalWithOwnerCheck(supabase, proposalId, user.id);
    
    if (error) {
      return errorResponse(status, error);
    }

    // Close proposal
    const now = new Date().toISOString();
    const { data, error: updateError } = await supabase
      .from('proposals')
      .update({
        status: 'closed',
        updated_at: now
      })
      .eq('id', proposalId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error closing proposal:', updateError);
      return errorResponse(500, 'Failed to close proposal');
    }
    
    return NextResponse.json(data as Proposal, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return errorResponse(500, 'An unexpected error occurred');
  }
}