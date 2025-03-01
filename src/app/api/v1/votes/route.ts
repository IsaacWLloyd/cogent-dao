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
    
    // Get votes for the decision including the username field
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select(`
        id,
        decision_id,
        user_id,
        username,
        decision,
        voting_logic,
        created_at
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
    
    // Generate a timestamp to distinguish multiple votes from the same user
    const timestamp = new Date().toISOString();
    
    // Create the vote with username included - using timestamp to make each vote unique
    const { data: newVote, error: voteError } = await supabase
      .from('votes')
      .insert({
        decision_id: body.decision_id,
        user_id: user.id,
        username: user.username || 'Anonymous',
        decision: body.decision,
        voting_logic: body.voting_logic || null,
        created_at: timestamp
      })
      .select()
      .single();
    
    if (voteError) {
      console.error('Error creating vote:', voteError);
      return errorResponse(500, 'Failed to cast vote');
    }
    
    // Fetch current vote_links from decision_chain
    const { data: currentDecision, error: fetchError } = await supabase
      .from('decision_chain')
      .select('vote_links')
      .eq('id', body.decision_id)
      .single();
      
    if (fetchError) {
      console.error('Error fetching decision:', fetchError);
      return errorResponse(500, 'Failed to update decision chain');
    }
    
    // Update vote_links to include the new vote ID
    const currentVoteLinks = currentDecision.vote_links || [];
    const updatedVoteLinks = Array.isArray(currentVoteLinks) 
      ? [...currentVoteLinks, newVote.id] 
      : [newVote.id];
    
    // Update the decision_chain with the new vote_links
    const { error: updateError } = await supabase
      .from('decision_chain')
      .update({ vote_links: updatedVoteLinks })
      .eq('id', body.decision_id);
    
    if (updateError) {
      console.error('Error updating vote links:', updateError);
      return errorResponse(500, 'Failed to update decision chain');
    }
    
    return NextResponse.json(newVote as Vote, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return errorResponse(500, 'An unexpected error occurred');
  }
}