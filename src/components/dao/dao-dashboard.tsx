"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { ProposalList } from "./proposal-list";
import { Card } from "@/src/components/ui/card";

interface DaoDashboardProps {
  userId: string;
}

export function DaoDashboard({ userId }: DaoDashboardProps) {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "my">("active");

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <Card className="p-6 mb-8 dark:bg-gradient-to-b dark:from-black/10 dark:to-transparent">
        <h1 className="text-3xl font-bold mb-2">Cogent DAO</h1>
        <p className="text-muted-foreground">
          A platform for decentralized decision making through proposals and voting.
        </p>
      </Card>

      <div className="flex space-x-1 mb-6">
        <Button
          variant={activeTab === "active" ? "default" : "outline"}
          onClick={() => setActiveTab("active")}
          className="flex-1"
        >
          Active Proposals
        </Button>
        <Button
          variant={activeTab === "my" ? "default" : "outline"}
          onClick={() => setActiveTab("my")}
          className="flex-1"
        >
          My Proposals
        </Button>
        <Button
          variant={activeTab === "all" ? "default" : "outline"}
          onClick={() => setActiveTab("all")}
          className="flex-1"
        >
          All Proposals
        </Button>
      </div>

      <ProposalList mode={activeTab} userId={userId} />
    </div>
  );
}