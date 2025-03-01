"use client";

import { DaoDashboard } from "./dao-dashboard";

interface DaoClientWrapperProps {
  userId: string;
}

export function DaoClientWrapper({ userId }: DaoClientWrapperProps) {
  return <DaoDashboard userId={userId} />;
}