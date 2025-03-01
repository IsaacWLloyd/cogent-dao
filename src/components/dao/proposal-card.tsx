"use client";

import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { useDaoApi } from "@/src/hooks/use-dao-api";
import { Proposal } from "@/src/lib/types";
import { useState } from "react";
import { Toast } from "@/src/components/ui/toast";
import { DecisionList } from "./decision-list";

interface ProposalCardProps {
  proposal: Proposal;
  isOwner: boolean;
  onEdit?: (proposal: Proposal) => void;
  onClose?: (proposal: Proposal) => void;
  onVote?: (proposalId: string) => void;
  refreshProposals?: () => void;
}

export function ProposalCard({
  proposal,
  isOwner,
  onEdit,
  onClose,
  onVote,
  refreshProposals,
}: ProposalCardProps) {
  const { closeProposal, loading } = useDaoApi();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | null }>({
    message: "",
    type: null,
  });

  const handleClose = async () => {
    try {
      const closedProposal = await closeProposal(proposal.id);
      if (closedProposal) {
        setToast({ message: "Proposal closed successfully", type: "success" });
        // Notify parent components that the proposal is closed
        onClose?.(closedProposal);
        // Refresh the proposals list to update UI state
        refreshProposals?.();
        // Close any open voting windows (this is handled by the parent through the onClose callback)
      }
    } catch (err) {
      setToast({ message: "Failed to close proposal", type: "error" });
    }
  };

  // Format the date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const [showDecisions, setShowDecisions] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  return (
    <Card className="p-6 w-full mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold">{proposal.title}</h3>
          <div className="text-sm text-gray-500 mb-2">
            {proposal.status === "open" ? (
              <span className="text-green-600 font-semibold">Open</span>
            ) : (
              <span className="text-red-600 font-semibold">Closed</span>
            )}
            {" • "}
            Created: {formatDate(proposal.created_at)}
          </div>
        </div>
        
        <div className="flex gap-2">
          {isOwner && proposal.status === "open" && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit?.(proposal)}
                disabled={loading}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleClose}
                disabled={loading}
              >
                Close
              </Button>
            </>
          )}
          {proposal.status === "open" && (
            <Button
              size="sm"
              onClick={() => {
                setHasVoted(true); // For demo - in real app, check if user has voted
                onVote?.(proposal.id);
              }}
              disabled={loading}
            >
              {hasVoted ? "Vote Again" : "Vote"}
            </Button>
          )}
        </div>
      </div>

      <p className="mt-4 whitespace-pre-line">{proposal.description}</p>
      
      <div className="mt-4 flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowDecisions(!showDecisions)}
        >
          {showDecisions ? "Hide Voting History" : "Show Voting History"}
        </Button>
      </div>
      
      {showDecisions && (
        <div className="mt-4">
          {/* @ts-ignore - Import is at runtime */}
          <DecisionList 
            proposalId={proposal.id} 
            isProposalOwner={isOwner} 
          />
        </div>
      )}

      {toast.type && <Toast message={toast.message} type={toast.type} />}
    </Card>
  );
}