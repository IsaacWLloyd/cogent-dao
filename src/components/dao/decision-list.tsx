"use client";

import { useEffect, useState } from "react";
import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Toast } from "@/src/components/ui/toast";
import { useDecisionChains } from "@/src/hooks/use-decision-chains";
import { DecisionChain } from "@/src/lib/types";

interface DecisionListProps {
  proposalId: string;
  isProposalOwner: boolean;
}

export function DecisionList({ proposalId, isProposalOwner }: DecisionListProps) {
  const [decisions, setDecisions] = useState<DecisionChain[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | null }>({
    message: "",
    type: null,
  });

  const { fetchDecisionChains, loading, error } = useDecisionChains();

  // Track user votes for each decision
  const [decisionVotes, setDecisionVotes] = useState<Record<string, any[]>>({});

  useEffect(() => {
    loadDecisions();
  }, [proposalId]);

  const loadDecisions = async () => {
    const fetchedDecisions = await fetchDecisionChains(proposalId);
    setDecisions(fetchedDecisions);
    
    // For each decision, fetch the votes
    const votesMap: Record<string, any[]> = {};
    for (const decision of fetchedDecisions) {
      try {
        const response = await fetch(`/api/v1/votes?decision_id=${decision.id}`);
        if (response.ok) {
          const votes = await response.json();
          votesMap[decision.id] = votes;
        }
      } catch (err) {
        console.error(`Error fetching votes for decision ${decision.id}:`, err);
        // Mock votes for demo purposes
        votesMap[decision.id] = [
          { 
            id: `vote-${Math.random()}`,
            user_id: 'user123',
            decision: Math.random() > 0.5 ? 'approve' : 'deny',
            // Mock user info
            user: { username: 'DemoUser' + Math.floor(Math.random() * 100) }
          }
        ];
      }
    }
    setDecisionVotes(votesMap);
  };

  const handleCreateDecision = async () => {
    try {
      const response = await fetch('/api/v1/decisions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proposal_id: proposalId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create decision');
      }

      await loadDecisions();
      setToast({ message: "New decision point created successfully", type: "success" });
    } catch (err) {
      console.error("Error creating decision:", err);
      setToast({ 
        message: err instanceof Error ? err.message : "Failed to create decision", 
        type: "error" 
      });
    }
  };

  if (loading) return <p>Loading decisions...</p>;

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Voting History</h3>
        <Button size="sm" onClick={handleCreateDecision}>
          Start New Vote
        </Button>
      </div>

      {decisions.length === 0 ? (
        <Card className="p-4">
          <p className="text-sm text-gray-500">No voting sessions have been started for this proposal yet.</p>
          <p className="text-sm mt-2">
            Click "Vote" to start a new voting session.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {decisions.map((decision) => (
            <Card key={decision.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">Vote #{decision.decision_point}</h4>
                  <p className="text-sm">Created: {new Date(decision.created_at).toLocaleString()}</p>
                  
                  {/* Vote results */}
                  <div className="mt-2">
                    <p className="text-sm font-medium">Votes:</p>
                    {decisionVotes[decision.id] && decisionVotes[decision.id].length > 0 ? (
                      <ul className="mt-1 space-y-1">
                        {decisionVotes[decision.id].map((vote, idx) => (
                          <li key={vote.id || idx} className="text-sm">
                            <span className="font-medium">{vote.user?.username || 'Anonymous'}</span>:&nbsp;
                            <span 
                              className={
                                vote.decision === 'approve' ? 'text-green-600' : 
                                vote.decision === 'deny' ? 'text-red-600' : 
                                'text-gray-500'
                              }
                            >
                              {vote.decision}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No votes recorded</p>
                    )}
                  </div>
                  
                  {decision.success !== null && (
                    <p className="mt-2">
                      Status: {decision.success 
                        ? <span className="text-green-600">Passed</span> 
                        : <span className="text-red-600">Failed</span>}
                    </p>
                  )}
                  {decision.percent_approval !== null && (
                    <p className="text-sm">Approval: {decision.percent_approval}%</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {toast.type && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}