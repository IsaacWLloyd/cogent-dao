import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/src/lib/supabase-server';
import { getUserFromRequest, errorResponse } from '@/src/lib/api-utils';
import { CreateProposalRequest, Proposal } from '@/src/lib/types';

// Create a new proposal
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    // Parse request body
    const body: CreateProposalRequest = await request.json();
    
    // Validate request
    if (!body.title || typeof body.title !== 'string') {
      return errorResponse(400, 'Title is required and must be a string');
    }
    
    if (!body.description || typeof body.description !== 'string') {
      return errorResponse(400, 'Description is required and must be a string');
    }
    
    // Additional validation to match database constraints
    const trimmedDescription = body.description.trim();
    if (trimmedDescription.length < 5) {
      return errorResponse(400, 'Description must be at least 5 characters long');
    }

    // Connect to Supabase
    const supabase = await createServerSupabaseClient();
    
    // Create proposal
    const { data, error } = await supabase
      .from('proposals')
      .insert({
        created_by: user.id,
        title: body.title,
        description: body.description,
        status: 'open',
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating proposal:', error);
      return errorResponse(500, 'Failed to create proposal');
    }
    
    return NextResponse.json(data as Proposal, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return errorResponse(500, 'An unexpected error occurred');
  }
}

// Get all proposals
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }
    
    // Connect to Supabase
    const supabase = await createServerSupabaseClient();
    
    // Get all proposals
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching proposals:', error);
      return errorResponse(500, 'Failed to fetch proposals');
    }
    
    return NextResponse.json(data as Proposal[], { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return errorResponse(500, 'An unexpected error occurred');
  }
}