import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from './supabase-server';
import { ApiError } from './types';
import { createServerClient } from '@supabase/ssr';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getUserFromRequest(_request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null;
  }
  
  return {
    id: session.user.id,
    email: session.user.email,
  };
}

export function errorResponse(status: number, message: string): NextResponse<ApiError> {
  return NextResponse.json({ error: message }, { status });
}

export function validateUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function getProposalWithOwnerCheck(
  supabase: ReturnType<typeof createServerClient>,
  proposalId: string,
  userId: string
) {
  if (!validateUuid(proposalId)) {
    return { error: 'Invalid proposal ID format', status: 400 };
  }

  const { data: proposal, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', proposalId)
    .single();

  if (error) {
    return { error: 'Proposal not found', status: 404 };
  }

  if (proposal.created_by !== userId) {
    return { error: 'You do not have permission to modify this proposal', status: 403 };
  }

  if (proposal.status !== 'open') {
    return { error: 'This proposal is no longer active', status: 400 };
  }

  return { proposal };
}