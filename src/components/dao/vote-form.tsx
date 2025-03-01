"use client";

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Toast } from "@/src/components/ui/toast";
import { useDaoApi } from "@/src/hooks/use-dao-api";
import { useDecisionChains } from "@/src/hooks/use-decision-chains";
import { VoteDecision, DecisionChain } from "@/src/lib/types";

interface VoteFormProps {
  decisionId: string; // This is the proposalId
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function VoteForm({ decisionId, onSuccess, onCancel }: VoteFormProps) {
  const [decision, setDecision] = useState<VoteDecision | ''>('');
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | null }>({
    message: "",
    type: null,
  });
  const [activeDecision, setActiveDecision] = useState<DecisionChain | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loadingChangingVote, setLoadingChangingVote] = useState(false);

  const { castVote, loading, error } = useDaoApi();
  const { getLatestDecision, loading: loadingDecision } = useDecisionChains();
  
  useEffect(() => {
    const fetchOrCreateDecision = async () => {
      try {
        // Try to get the latest decision chain for this proposal
        const latest = await getLatestDecision(decisionId);
        
        // If no decision exists, automatically create one
        if (!latest) {
          await createDecisionPoint();
        } else {
          setActiveDecision(latest);
        }
      } catch (err) {
        console.error("Error fetching/creating decision:", err);
        setToast({ 
          message: "Failed to prepare voting session", 
          type: "error" 
        });
      }
    };
    
    fetchOrCreateDecision();
  }, [decisionId]);
  
  // Function to create a decision point
  const createDecisionPoint = async () => {
    try {
      const response = await fetch('/api/v1/decisions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proposal_id: decisionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create decision point');
      }

      const newDecision = await response.json();
      setActiveDecision(newDecision);
      return newDecision;
    } catch (err) {
      console.error("Error creating decision:", err);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!decision) {
      setToast({ message: "Please select a decision", type: "error" });
      return;
    }
    
    if (!activeDecision) {
      setToast({ message: "No active decision found", type: "error" });
      return;
    }

    try {
      const vote = await castVote({
        decision_id: activeDecision.id,
        decision: decision as VoteDecision,
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

  const decisionOptions: { value: VoteDecision; label: string }[] = [
    { value: "approve", label: "Approve" },
    { value: "deny", label: "Deny" },
    { value: "abstain", label: "Abstain" },
  ];

  // Change vote by creating a new decision point
  const handleChangeVote = async () => {
    try {
      setLoadingChangingVote(true);
      // Create a new decision point
      await createDecisionPoint();
      // Reset the decision selection
      setDecision('');
      setToast({ message: "You can now change your vote", type: "success" });
    } catch (err) {
      console.error("Error creating new decision point:", err);
      setToast({ 
        message: "Failed to create new voting session", 
        type: "error" 
      });
    } finally {
      setLoadingChangingVote(false);
    }
  };

  return (
    <Card className="w-full p-6">
      <h2 className="text-xl font-bold mb-4">{hasVoted ? "Change Your Vote" : "Cast Your Vote"}</h2>
      
      {loadingDecision ? (
        <p>Loading voting options...</p>
      ) : !activeDecision ? (
        <div>
          <p className="text-amber-600 mb-4">Unable to load voting options.</p>
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
            <div className="space-y-2">
              <p className="text-sm font-medium">Change your vote:</p>
              <div className="flex flex-col space-y-2">
                {decisionOptions.map((option) => (
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

            <div className="flex space-x-2">
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
          <div className="space-y-2">
            <p className="text-sm font-medium">Select your vote:</p>
            <div className="flex flex-col space-y-2">
              {decisionOptions.map((option) => (
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

          <div className="flex space-x-2">
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