"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Card } from "@/src/components/ui/card";
import { Toast } from "@/src/components/ui/toast";
import { useDaoApi } from "@/src/hooks/use-dao-api";
import { CreateProposalRequest, Proposal } from "@/src/lib/types";

interface ProposalFormProps {
  onSuccess?: (proposal: Proposal) => void;
  proposal?: Proposal;
  mode?: "create" | "edit";
}

export function ProposalForm({ 
  onSuccess, 
  proposal,
  mode = "create" 
}: ProposalFormProps) {
  const [title, setTitle] = useState(proposal?.title || "");
  const [description, setDescription] = useState(proposal?.description || "");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | null }>({
    message: "",
    type: null,
  });

  const { createProposal, updateProposal, loading, error } = useDaoApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setToast({ message: "Title is required", type: "error" });
      return;
    }
    
    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      setToast({ message: "Description is required", type: "error" });
      return;
    }
    
    if (trimmedDescription.length < 5) {
      setToast({ message: "Description must be at least 5 characters long", type: "error" });
      return;
    }
    
    const data: CreateProposalRequest = {
      title: title.trim(),
      description: trimmedDescription,
    };

    try {
      if (mode === "create") {
        const newProposal = await createProposal(data);
        if (newProposal) {
          setToast({ message: "Proposal created successfully", type: "success" });
          setTitle("");
          setDescription("");
          onSuccess?.(newProposal);
        }
      } else if (proposal?.id) {
        const updatedProposal = await updateProposal(proposal.id, data);
        if (updatedProposal) {
          setToast({ message: "Proposal updated successfully", type: "success" });
          onSuccess?.(updatedProposal);
        }
      }
    } catch (err) {
      setToast({ message: "Failed to save proposal", type: "error" });
    }
  };

  return (
    <Card className="w-full p-6">
      <h2 className="text-2xl font-bold mb-4">
        {mode === "create" ? "Create New Proposal" : "Edit Proposal"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter proposal title"
            className="w-full"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              // Check if the field was previously empty to show validation
              if (!description.trim() && e.target.value.trim()) {
                setToast({ message: "", type: null });
              }
            }}
            placeholder="Enter proposal description (minimum 5 characters)"
            className="w-full min-h-32"
            disabled={loading}
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Saving..." : mode === "create" ? "Create Proposal" : "Update Proposal"}
        </Button>
      </form>

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