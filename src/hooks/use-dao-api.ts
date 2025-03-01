"use client";

import { useState } from "react";
import { 
  Proposal, 
  ProposalStatus, 
  CreateProposalRequest, 
  UpdateProposalRequest, 
  CreateVoteRequest, 
  Vote 
} from "@/src/lib/types";

// Custom hook for interacting with the DAO API
export function useDaoApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all proposals
  const fetchProposals = async (): Promise<Proposal[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/proposals');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch proposals');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch active proposals
  const fetchActiveProposals = async (): Promise<Proposal[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/proposals/active');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch active proposals');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's proposals
  const fetchUserProposals = async (): Promise<Proposal[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/proposals/me');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch your proposals');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create a new proposal
  const createProposal = async (proposalData: CreateProposalRequest): Promise<Proposal | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proposalData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create proposal');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update a proposal
  const updateProposal = async (proposalId: string, updateData: UpdateProposalRequest): Promise<Proposal | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/proposals/${proposalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update proposal');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Close a proposal
  const closeProposal = async (proposalId: string): Promise<Proposal | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/proposals/${proposalId}/close`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to close proposal');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cast a vote
  const castVote = async (voteData: CreateVoteRequest): Promise<Vote | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voteData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cast vote');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchProposals,
    fetchActiveProposals,
    fetchUserProposals,
    createProposal,
    updateProposal,
    closeProposal,
    castVote,
  };
}