import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { getUserFromRequest, errorResponse, validateUuid } from '@/src/lib/api-utils';
import { DecisionChain } from '@/src/lib/types';

// Create a new decision chain record
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    // Parse request body
    const body = await request.json();
    
    // Validate proposal ID
    if (!body.proposal_id || !validateUuid(body.proposal_id)) {
      return errorResponse(400, 'Valid proposal ID is required');
    }

    // Connect to Supabase
    const supabase = await createServerSupabaseClient();
    
    // Check if the proposal exists and is open
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('id, status, created_by')
      .eq('id', body.proposal_id)
      .single();
    
    if (proposalError) {
      return errorResponse(404, 'Proposal not found');
    }
    
    if (proposal.status !== 'open') {
      return errorResponse(400, 'Cannot create decision for a closed proposal');
    }
    
    // Anyone can create a decision point for voting
    // This allows users to vote without requiring the proposal creator to create decision points
    
    // Get the highest decision point for this proposal
    const { data: decisions, error: decisionsError } = await supabase
      .from('decision_chain')
      .select('decision_point')
      .eq('proposal_id', body.proposal_id)
      .order('decision_point', { ascending: false })
      .limit(1);
    
    const nextDecisionPoint = decisions && decisions.length > 0 ? decisions[0].decision_point + 1 : 1;
    
    // Create the decision chain record
    const { data: newDecision, error: decisionError } = await supabase
      .from('decision_chain')
      .insert({
        proposal_id: body.proposal_id,
        decision_point: nextDecisionPoint,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (decisionError) {
      console.error('Error creating decision:', decisionError);
      return errorResponse(500, 'Failed to create decision');
    }
    
    return NextResponse.json(newDecision as DecisionChain, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return errorResponse(500, 'An unexpected error occurred');
  }
}

// Get all decisions
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    const url = new URL(request.url);
    const proposalId = url.searchParams.get('proposal_id');
    
    // Connect to Supabase
    const supabase = await createServerSupabaseClient();
    
    // If proposal ID is provided, get decisions for that proposal
    if (proposalId) {
      if (!validateUuid(proposalId)) {
        return errorResponse(400, 'Invalid proposal ID format');
      }
      
      const { data: decisions, error: decisionsError } = await supabase
        .from('decision_chain')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('decision_point', { ascending: false });
      
      if (decisionsError) {
        console.error('Error fetching decisions:', decisionsError);
        return errorResponse(500, 'Failed to fetch decisions');
      }
      
      return NextResponse.json(decisions as DecisionChain[], { status: 200 });
    }
    
    // Otherwise, get all decisions
    const { data: decisions, error: decisionsError } = await supabase
      .from('decision_chain')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (decisionsError) {
      console.error('Error fetching decisions:', decisionsError);
      return errorResponse(500, 'Failed to fetch decisions');
    }
    
    return NextResponse.json(decisions as DecisionChain[], { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return errorResponse(500, 'An unexpected error occurred');
  }
}