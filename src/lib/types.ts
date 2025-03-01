// Database models
export type User = {
  id: string;
  username: string | null;
  email: string | null;
  created_at: string;
};

export type Proposal = {
  id: string;
  created_by: string;
  title: string;
  description: string;
  status: ProposalStatus;
  created_at: string;
  updated_at: string;
};

export type Vote = {
  id: string;
  decision_id: string;
  user_id: string;
  username?: string;
  decision: VoteDecision;
  voting_logic?: string;
  created_at: string;
  agent_vote?: boolean;
  users?: {
    username?: string;
    email?: string;
  };
};

export type DecisionChain = {
  id: string;
  proposal_id: string;
  decision_point: number;
  success?: boolean;
  percent_approval?: number;
  vote_links?: Record<string, unknown>;
  created_at: string;
};

// Enums
export type ProposalStatus = 'open' | 'closed';
export type VoteDecision = 'approve' | 'deny' | 'abstain';

// API request types
export type CreateProposalRequest = {
  title: string;
  description: string;
};

export type UpdateProposalRequest = {
  title: string;
  description: string;
};

export type CreateVoteRequest = {
  decision_id: string;
  decision: VoteDecision;
  voting_logic?: string;
};

// API response types
export type ApiError = {
  error: string;
};