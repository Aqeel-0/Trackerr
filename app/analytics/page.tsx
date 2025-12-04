"use client";

import dynamic from "next/dynamic";
import AppLayout from "@/components/AppLayout";

const AnalyticsView = dynamic(() => import("@/components/AnalyticsView"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <div className="animate-pulse text-slate-400">Loading analytics...</div>
    </div>
  ),
});

export default function AnalyticsPage() {
  return (
    <AppLayout title="Analytics">
      <div className="h-full pb-16 md:pb-0 overflow-auto">
        <AnalyticsView />
      </div>
    </AppLayout>
  );
}


