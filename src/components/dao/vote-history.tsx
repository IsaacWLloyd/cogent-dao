"use client";

import { useEffect, useState } from "react";
import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Toast } from "@/src/components/ui/toast";
import { useProposalDecisions } from "@/src/hooks/use-proposal-decisions";
import { DecisionChain, Vote } from "@/src/lib/types";

interface VoteHistoryProps {
  proposalId: string;
  isProposalOwner: boolean;
}

export function VoteHistory({ proposalId, isProposalOwner }: VoteHistoryProps) {
  const [proposalDecision, setProposalDecision] = useState<DecisionChain | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | null }>({
    message: "",
    type: null,
  });

  const { fetchProposalDecision, loading: decisionLoading, error } = useProposalDecisions();

  // Track votes for the proposal
  const [votes, setVotes] = useState<Vote[]>([]);
  const [votesLoading, setVotesLoading] = useState(true);

  useEffect(() => {
    loadProposalVotes();
  }, [proposalId]);

  const loadProposalVotes = async () => {
    try {
      setVotesLoading(true);
      
      // First, fetch the decision record for this proposal
      const decision = await fetchProposalDecision(proposalId);
      setProposalDecision(decision);
      
      if (!decision) {
        setVotesLoading(false);
        return;
      }
      
      // Fetch all votes for this proposal's decision record
      try {
        const response = await fetch(`/api/v1/votes?decision_id=${decision.id}`);
        if (response.ok) {
          const fetchedVotes = await response.json();
          // Sort votes by created_at in descending order (newest first)
          setVotes(fetchedVotes.sort((a: Vote, b: Vote) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ));
        } else {
          console.error('Failed to fetch votes:', await response.text());
          setVotes([]);
        }
      } catch (err) {
        console.error(`Error fetching votes for proposal ${proposalId}:`, err);
        setVotes([]);
      }
    } finally {
      setVotesLoading(false);
    }
  };

  if (decisionLoading || votesLoading) return <p>Loading voting history...</p>;

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Voting History</h3>
      </div>

      {!proposalDecision ? (
        <Card className="p-4">
          <p className="text-sm text-gray-500">No voting has started for this proposal yet.</p>
          <p className="text-sm mt-2">
            Click "Vote" to cast the first vote.
          </p>
        </Card>
      ) : votes.length === 0 ? (
        <Card className="p-4">
          <p className="text-sm text-gray-500">No votes have been cast on this proposal yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          <Card className="p-4">
            <h4 className="font-medium mb-3">All Votes</h4>
            <div className="space-y-4">
              {votes.map((vote) => (
                <div key={vote.id} className="border-b pb-3 last:border-0">
                  <div className="flex justify-between">
                    <div>
                      <span className="font-medium">{vote.username || 'Anonymous'}</span>
                      &nbsp;voted&nbsp;
                      <span 
                        className={
                          vote.decision === 'approve' ? 'text-green-600 font-medium' : 
                          vote.decision === 'deny' ? 'text-red-600 font-medium' : 
                          'text-amber-600 font-medium'
                        }
                      >
                        {vote.decision}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(vote.created_at).toLocaleString()}
                    </div>
                  </div>
                  
                  {vote.voting_logic && (
                    <div className="mt-1 text-sm italic bg-background border border-input p-2 rounded">
                      "{vote.voting_logic}"
                    </div>
                  )}
                  
                  {vote.agent_vote && (
                    <div className="mt-1">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Agent Vote</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
          
          {proposalDecision?.success !== null && (
            <Card className="p-4">
              <h4 className="font-medium">Vote Result</h4>
              <p className="mt-2">
                Status: {proposalDecision.success 
                  ? <span className="text-green-600 font-medium">Passed</span> 
                  : <span className="text-red-600 font-medium">Failed</span>}
              </p>
              {proposalDecision.percent_approval !== null && (
                <p className="text-sm mt-1">Approval: {proposalDecision.percent_approval}%</p>
              )}
            </Card>
          )}
        </div>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {toast.type && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
        />
      )}
    </div>
  );
}