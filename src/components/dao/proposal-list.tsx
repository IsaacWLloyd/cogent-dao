"use client";

import { useEffect, useState } from "react";
import { useDaoApi } from "@/src/hooks/use-dao-api";
import { ProposalCard } from "./proposal-card";
import { Proposal } from "@/src/lib/types";
import { Button } from "@/src/components/ui/button";
import { Toast } from "@/src/components/ui/toast";
import { ProposalForm } from "./proposal-form";
import { VoteForm } from "./vote-form";

interface ProposalListProps {
  mode: "all" | "active" | "my";
  userId: string;
}

export function ProposalList({ mode, userId }: ProposalListProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [votingProposalId, setVotingProposalId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | null }>({
    message: "",
    type: null,
  });

  const { 
    fetchProposals, 
    fetchActiveProposals, 
    fetchUserProposals, 
    loading, 
    error 
  } = useDaoApi();

  const fetchProposalsByMode = async () => {
    let fetchedProposals: Proposal[] = [];
    
    try {
      if (mode === "all") {
        fetchedProposals = await fetchProposals();
      } else if (mode === "active") {
        fetchedProposals = await fetchActiveProposals();
      } else if (mode === "my") {
        fetchedProposals = await fetchUserProposals();
      }
      
      setProposals(fetchedProposals);
    } catch (err) {
      setToast({ 
        message: "Failed to load proposals", 
        type: "error" 
      });
    }
  };

  useEffect(() => {
    fetchProposalsByMode();
  }, [mode]);

  const handleEdit = (proposal: Proposal) => {
    setEditingProposal(proposal);
    setShowForm(true);
  };

  const handleVote = (proposalId: string) => {
    setVotingProposalId(proposalId);
  };
  
  // Handle proposal closure - also closes any open voting forms
  const handleProposalClosed = (proposal: Proposal) => {
    // If the user is currently voting on this proposal, close the voting form
    if (votingProposalId === proposal.id) {
      setVotingProposalId(null);
    }
    // Refresh the proposals list
    fetchProposalsByMode();
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProposal(null);
    fetchProposalsByMode();
  };

  const handleVoteSuccess = () => {
    // Clear the voting proposal ID to close the vote form
    setVotingProposalId(null);
    setToast({ message: "Vote cast successfully", type: "success" });
    // Refresh the proposals to update their state
    fetchProposalsByMode();
  };

  const getTitle = () => {
    switch (mode) {
      case "all": return "All Proposals";
      case "active": return "Active Proposals";
      case "my": return "My Proposals";
      default: return "Proposals";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{getTitle()}</h1>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          Create Proposal
        </Button>
      </div>

      {showForm && (
        <div className="mb-8">
          <ProposalForm
            proposal={editingProposal || undefined}
            mode={editingProposal ? "edit" : "create"}
            onSuccess={handleFormSuccess}
          />
          <Button 
            variant="outline" 
            onClick={() => {
              setShowForm(false);
              setEditingProposal(null);
            }}
            className="mt-4"
          >
            Cancel
          </Button>
        </div>
      )}

      {votingProposalId && (
        <div className="mb-8">
          <VoteForm
            decisionId={votingProposalId}
            onSuccess={handleVoteSuccess}
            onCancel={() => setVotingProposalId(null)}
          />
        </div>
      )}

      {loading && <p>Loading proposals...</p>}
      
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && proposals.length === 0 && (
        <p className="text-gray-500">No proposals found.</p>
      )}

      <div className="space-y-4">
        {proposals.map((proposal) => (
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
            isOwner={proposal.created_by === userId}
            onEdit={handleEdit}
            onVote={handleVote}
            onClose={handleProposalClosed}
            refreshProposals={fetchProposalsByMode}
          />
        ))}
      </div>

      {toast.type && (
        <Toast message={toast.message} type={toast.type} />
      )}
    </div>
  );
}