"use client";

import { useState } from "react";
import { DecisionChain } from "@/src/lib/types";

export function useDecisionChains() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch decision chains for a proposal
  const fetchDecisionChains = async (proposalId: string): Promise<DecisionChain[]> => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the real API endpoint
      const response = await fetch(`/api/v1/decisions?proposal_id=${proposalId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch decision chains');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching decision chains:', err);
      setError('Failed to fetch decisions');
      
      // For the demo, create a decision chain if none exists
      // This would be removed in production and handled properly via UI
      try {
        // Create a decision chain for this proposal
        const createResponse = await fetch('/api/v1/decisions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ proposal_id: proposalId }),
        });
        
        if (createResponse.ok) {
          const newDecision = await createResponse.json();
          return [newDecision];
        }
      } catch (createErr) {
        console.error('Failed to create fallback decision:', createErr);
      }
      
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get the latest decision for a proposal
  const getLatestDecision = async (proposalId: string): Promise<DecisionChain | null> => {
    try {
      const chains = await fetchDecisionChains(proposalId);
      if (chains.length === 0) return null;
      
      // Sort by decision_point in descending order
      return chains.sort((a, b) => b.decision_point - a.decision_point)[0];
    } catch (err) {
      setError('Failed to get latest decision');
      return null;
    }
  };

  return {
    loading,
    error,
    fetchDecisionChains,
    getLatestDecision,
  };
}