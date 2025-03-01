"use client";

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Toast } from "@/src/components/ui/toast";
import { useDaoApi } from "@/src/hooks/use-dao-api";
import { useProposalDecisions } from "@/src/hooks/use-proposal-decisions";
import { VoteDecision, DecisionChain } from "@/src/lib/types";

interface VoteFormProps {
  proposalId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function VoteForm({ proposalId, onSuccess, onCancel }: VoteFormProps) {
  const [decision, setDecision] = useState<VoteDecision | ''>('');
  const [votingLogic, setVotingLogic] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | null }>({
    message: "",
    type: null,
  });
  const [proposalDecision, setProposalDecision] = useState<DecisionChain | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loadingChangingVote, setLoadingChangingVote] = useState(false);

  const { castVote, loading, error } = useDaoApi();
  const { fetchProposalDecision, loading: loadingDecision } = useProposalDecisions();
  
  useEffect(() => {
    const fetchDecision = async () => {
      try {
        // Try to get the decision chain for this proposal
        const decision = await fetchProposalDecision(proposalId);
        if (decision) {
          setProposalDecision(decision);
        } else {
          // If no decision exists, we'll need to inform the user
          console.log("No decision record found for this proposal");
          setToast({ 
            message: "No voting record found for this proposal", 
            type: "error" 
          });
        }
      } catch (err) {
        console.error("Error fetching proposal decision:", err);
        setToast({ 
          message: "Failed to load voting data", 
          type: "error" 
        });
      }
    };
    
    fetchDecision();
  }, [proposalId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!decision) {
      setToast({ message: "Please select a vote option", type: "error" });
      return;
    }
    
    if (!proposalDecision) {
      setToast({ message: "No proposal decision record found", type: "error" });
      return;
    }

    try {
      const vote = await castVote({
        decision_id: proposalDecision.id, // The ID of the decision chain record
        decision: decision as VoteDecision, // The user's vote choice
        voting_logic: votingLogic.trim() || undefined // Optional explanation
      });
      
      if (vote) {
        setToast({ message: "Vote cast successfully", type: "success" });
        
        // If this is a new vote (not changing an existing vote), close the form
        if (!hasVoted) {
          // Delay closing slightly to show the success message
          setTimeout(() => {
            onSuccess?.();
          }, 1500);
        } else {
          // If changing a vote, update the state but keep the form open
          setHasVoted(true);
        }
      }
    } catch (err) {
      setToast({ message: "Failed to cast vote", type: "error" });
    }
  };

  const voteOptions: { value: VoteDecision; label: string }[] = [
    { value: "approve", label: "Approve" },
    { value: "deny", label: "Deny" },
    { value: "abstain", label: "Abstain" },
  ];

  // Prepare to change vote
  const handleChangeVote = () => {
    // Reset the decision selection and voting logic for a new vote
    setDecision('');
    setVotingLogic('');
    // Show the vote form
    setHasVoted(false);
    setToast({ message: "You can now change your vote", type: "success" });
  };

  return (
    <Card className="w-full p-6">
      <h2 className="text-xl font-bold mb-4">{hasVoted ? "Change Your Vote" : "Cast Your Vote"}</h2>
      
      {loadingDecision ? (
        <p>Loading voting options...</p>
      ) : !proposalDecision ? (
        <div>
          <p className="text-amber-600 mb-4">No voting record found for this proposal.</p>
          <p className="text-sm mb-4">Please try again. The system will create a voting record automatically.</p>
          <Button variant="outline" onClick={onCancel} className="w-full">
            Go Back
          </Button>
        </div>
      ) : hasVoted ? (
        <>
          <div className="p-4 bg-green-50 border border-green-200 rounded-md mb-6">
            <p className="text-green-700 font-medium">Your vote has been recorded!</p>
            <p className="text-sm text-green-600 mt-1">
              You voted: <span className="font-semibold">{decision}</span>
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Change your vote:</p>
                <div className="flex flex-col space-y-2">
                  {voteOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="decision"
                        value={option.value}
                        checked={decision === option.value}
                        onChange={() => setDecision(option.value)}
                        className="h-4 w-4"
                        disabled={loading}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="voting-logic-change" className="block text-sm font-medium mb-2">
                  Explain your change (optional):
                </label>
                <textarea
                  id="voting-logic-change"
                  className="w-full border border-gray-300 rounded-md p-2 min-h-[80px] text-sm"
                  placeholder="Why did you change your vote? (optional)"
                  value={votingLogic}
                  onChange={(e) => setVotingLogic(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex space-x-2 mt-4">
              <Button type="submit" disabled={loading || !decision} className="flex-1">
                {loading ? "Submitting..." : "Submit New Vote"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  // Call the onSuccess callback to close the voting form
                  onSuccess?.();
                }} 
                className="flex-1"
              >
                Done
              </Button>
            </div>
          </form>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Select your vote:</p>
              <div className="flex flex-col space-y-2">
                {voteOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="decision"
                      value={option.value}
                      checked={decision === option.value}
                      onChange={() => setDecision(option.value)}
                      className="h-4 w-4"
                      disabled={loading}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label htmlFor="voting-logic" className="block text-sm font-medium mb-2">
                Explain your vote (optional):
              </label>
              <textarea
                id="voting-logic"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[80px] text-sm"
                placeholder="Why are you voting this way? (optional)"
                value={votingLogic}
                onChange={(e) => setVotingLogic(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex space-x-2 mt-4">
            <Button type="submit" disabled={loading || !decision} className="flex-1">
              {loading ? "Submitting..." : "Submit Vote"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
      {toast.type && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
        />
      )}
    </Card>
  );
}