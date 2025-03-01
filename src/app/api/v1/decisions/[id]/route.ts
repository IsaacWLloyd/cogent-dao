import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { getUserFromRequest, errorResponse, validateUuid } from '@/src/lib/api-utils';
import { DecisionChain } from '@/src/lib/types';

// Get a specific decision
export async function GET(
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
    }

    const decisionId = params.id;
    
    if (!validateUuid(decisionId)) {
      return errorResponse(400, 'Invalid decision ID format');
    }

    // Connect to Supabase
    const supabase = await createServerSupabaseClient();
    
    // Get the decision
    const { data: decision, error: decisionError } = await supabase
      .from('decision_chain')
      .select('*')
      .eq('id', decisionId)
      .single();
    
    if (decisionError) {
      return errorResponse(404, 'Decision not found');
    }
    
    return NextResponse.json(decision as DecisionChain, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return errorResponse(500, 'An unexpected error occurred');
  }
}

// Update a decision (for setting success, percent_approval, vote_links)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    const decisionId = params.id;
    
    if (!validateUuid(decisionId)) {
      return errorResponse(400, 'Invalid decision ID format');
    }

    // Parse request body
    const body = await request.json();
    
    // Connect to Supabase
    const supabase = await createServerSupabaseClient();
    
    // Get the decision to check if it exists and get the proposal ID
    const { data: decision, error: decisionError } = await supabase
      .from('decision_chain')
      .select('*, proposals!inner(created_by)')
      .eq('id', decisionId)
      .single();
    
    if (decisionError) {
      return errorResponse(404, 'Decision not found');
    }
    
    // Check if user is the proposal creator
    if (decision.proposals.created_by !== user.id) {
      return errorResponse(403, 'Only the proposal creator can update decisions');
    }
    
    // Update the decision
    const updates: Partial<DecisionChain> = {};
    
    if (body.success !== undefined) {
      updates.success = body.success;
    }
    
    if (body.percent_approval !== undefined) {
      updates.percent_approval = body.percent_approval;
    }
    
    if (body.vote_links !== undefined) {
      updates.vote_links = body.vote_links;
    }
    
    const { data: updatedDecision, error: updateError } = await supabase
      .from('decision_chain')
      .update(updates)
      .eq('id', decisionId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating decision:', updateError);
      return errorResponse(500, 'Failed to update decision');
    }
    
    return NextResponse.json(updatedDecision as DecisionChain, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return errorResponse(500, 'An unexpected error occurred');
  }
}