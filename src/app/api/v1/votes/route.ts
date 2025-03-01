import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { getUserFromRequest, errorResponse, validateUuid } from '@/src/lib/api-utils';
import { CreateVoteRequest, Vote, VoteDecision } from '@/src/lib/types';

// Get votes for a decision
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    const url = new URL(request.url);
    const decisionId = url.searchParams.get('decision_id');
    
    if (!decisionId || !validateUuid(decisionId)) {
      return errorResponse(400, 'Valid decision ID is required');
    }

    // Connect to Supabase
    const supabase = await createServerSupabaseClient();
    
    // Get votes for the decision with username from users table
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select(`
        id,
        decision_id,
        user_id,
        decision,
        voting_logic,
        created_at,
        users:user_id (
          username
        )
      `)
      .eq('decision_id', decisionId);
    
    if (votesError) {
      console.error('Error fetching votes:', votesError);
      return errorResponse(500, 'Failed to fetch votes');
    }
    
    return NextResponse.json(votes, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return errorResponse(500, 'An unexpected error occurred');
  }
}

// Cast a vote on a decision
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    // Parse request body
    const body: CreateVoteRequest = await request.json();
    
    // Validate decision ID
    if (!body.decision_id || !validateUuid(body.decision_id)) {
      return errorResponse(400, 'Valid decision ID is required');
    }
    
    // Validate decision value
    const validDecisions: VoteDecision[] = ['approve', 'deny', 'abstain'];
    if (!body.decision || !validDecisions.includes(body.decision)) {
      return errorResponse(400, 'Decision must be one of: approve, deny, abstain');
    }

    // Connect to Supabase
    const supabase = await createServerSupabaseClient();
    
    // Check if decision exists
    const { data: decision, error: decisionError } = await supabase
      .from('decision_chain')
      .select('id, proposal_id')
      .eq('id', body.decision_id)
      .single();
    
    if (decisionError) {
      return errorResponse(404, 'Decision not found');
    }
    
    // Check if proposal is still open
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('status')
      .eq('id', decision.proposal_id)
      .single();
    
    if (proposalError) {
      return errorResponse(404, 'Associated proposal not found');
    }
    
    if (proposal.status !== 'open') {
      return errorResponse(400, 'Cannot vote on a closed proposal');
    }
    
    // Check if user has already voted
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('decision_id', body.decision_id)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (existingVote) {
      return errorResponse(400, 'You have already voted on this decision');
    }
    
    // Create vote
    const { data: newVote, error: voteError } = await supabase
      .from('votes')
      .insert({
        decision_id: body.decision_id,
        user_id: user.id,
        decision: body.decision,
      })
      .select()
      .single();
    
    if (voteError) {
      console.error('Error creating vote:', voteError);
      return errorResponse(500, 'Failed to cast vote');
    }
    
    return NextResponse.json(newVote as Vote, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return errorResponse(500, 'An unexpected error occurred');
  }
}