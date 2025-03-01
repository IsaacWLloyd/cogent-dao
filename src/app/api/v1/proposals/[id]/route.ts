import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { getUserFromRequest, errorResponse, getProposalWithOwnerCheck } from '@/src/lib/api-utils';
import { UpdateProposalRequest, Proposal } from '@/src/lib/types';

// Edit an active proposal
export async function PUT(
  request: NextRequest,
  context: unknown // Use unknown instead of any
) {
  try {
    // Type assertion with runtime validation
    const params = (context as { params?: { id?: string } })?.params
    if (!params?.id || typeof params.id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid job ID parameter' },
        { status: 400 }
      )
    }

    const user = await getUserFromRequest(request);
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }    const { id } = params

    const proposalId = params.id;
    
    // Parse request body
    const body: UpdateProposalRequest = await request.json();
    
    // Validate request
    if (!body.title || typeof body.title !== 'string') {
      return errorResponse(400, 'Title is required and must be a string');
    }
    
    if (!body.description || typeof body.description !== 'string') {
      return errorResponse(400, 'Description is required and must be a string');
    }

    // Connect to Supabase
    const supabase = await createServerSupabaseClient();
    
    // Check proposal exists, user is owner, and proposal is open
    const { error, status } = await getProposalWithOwnerCheck(supabase, proposalId, user.id);
    
    if (error) {
      return errorResponse(status, error);
    }

    // Update proposal
    const now = new Date().toISOString();
    const { data, error: updateError } = await supabase
      .from('proposals')
      .update({
        title: body.title,
        description: body.description,
        updated_at: now
      })
      .eq('id', proposalId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating proposal:', updateError);
      return errorResponse(500, 'Failed to update proposal');
    }
    
    return NextResponse.json(data as Proposal, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return errorResponse(500, 'An unexpected error occurred');
  }
}