"use client";

import { useState } from "react";
import { DecisionChain } from "@/src/lib/types";

export function useProposalDecisions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch proposal decision record
  const fetchProposalDecision = async (proposalId: string): Promise<DecisionChain | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the real API endpoint
      const response = await fetch(`/api/v1/decisions?proposal_id=${proposalId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch proposal decision record');
      }
      
      const data = await response.json();
      
      // We expect only one decision chain per proposal
      if (data && data.length > 0) {
        return data[0];
      }
      
      return null;
    } catch (err) {
      console.error('Error fetching proposal decision:', err);
      setError('Failed to fetch proposal decision');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchProposalDecision,
  };
}