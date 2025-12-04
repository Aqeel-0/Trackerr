"use client";

import MonthlyView from "@/components/MonthlyView";
import AppLayout from "@/components/AppLayout";

export default function TrackerPage() {
  return (
    <AppLayout title="Habit Tracker">
      <div className="h-full pb-16 md:pb-0 bg-white dark:bg-slate-900">
        <MonthlyView />
      </div>
    </AppLayout>
  );
}
