"use client";

import { useState } from "react";
import { TopBar } from "./TopBar";
import { TabNav } from "./TabNav";
import { ExecutiveView } from "./ExecutiveView";
import { AdjusterDefenseView } from "./AdjusterDefenseView";
import { ReferralLeaderboardView } from "./ReferralLeaderboardView";
import { ChatWidget } from "./ChatWidget";
import { Toast, ToastProvider } from "./Toast";
import { countOpenIssues, sumPendingFees } from "@/lib/dashboard-logic";
import type { DashboardData } from "@/lib/types";

interface DashboardShellProps {
  data: DashboardData;
}

export function DashboardShell({ data }: DashboardShellProps) {
  const [activeTab, setActiveTab] = useState("t1");
  const [issueCount, setIssueCount] = useState(() => countOpenIssues(data.cases));
  const [pending, setPending] = useState(() => sumPendingFees(data.partners));

  const tabs = [
    { id: "t1", label: "Executive AR & Cash" },
    { id: "t2", label: "Adjuster Defense", badge: issueCount },
    { id: "t3", label: "Referral Leaderboard" },
  ];

  return (
    <ToastProvider>
      <TopBar
        brandName={data.brandName}
        location={data.location}
        notificationCount={data.notificationCount}
        avatarInitial={data.avatarInitial}
      />
      <TabNav tabs={tabs} active={activeTab} onChange={setActiveTab} />
      <main className="mx-auto w-full max-w-4xl px-6 py-5.5 pb-12">
        <div hidden={activeTab !== "t1"}>
          <ExecutiveView
            totalAr={data.totalAr}
            criticalAr={data.criticalAr}
            periodStats={data.periodStats}
            referralPending={pending}
            agingSegments={data.agingSegments}
            agingNote={data.agingNote}
            carriers={data.carriers}
            carrierInsight={data.carrierInsight}
          />
        </div>
        <div hidden={activeTab !== "t2"}>
          <AdjusterDefenseView initialCases={data.cases} onIssueCountChange={setIssueCount} />
        </div>
        <div hidden={activeTab !== "t3"}>
          <ReferralLeaderboardView
            initialPartners={data.partners}
            onPendingChange={setPending}
            referralInsight={data.referralInsight}
          />
        </div>
      </main>
      <ChatWidget />
      <Toast />
    </ToastProvider>
  );
}
