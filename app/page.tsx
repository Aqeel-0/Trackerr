"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import AddHabitForm from "@/components/AddHabitForm";
import MonthlyView from "@/components/MonthlyView";
import Sidebar from "@/components/Sidebar";
import Modal from "@/components/Modal";

const AnalyticsView = dynamic(() => import("@/components/AnalyticsView"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <div className="animate-pulse text-slate-400">Loading analytics...</div>
    </div>
  ),
});

export default function Home() {
  const [currentView, setCurrentView] = useState<"tracker" | "analytics">("tracker");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    setFormattedDate(
      new Date().toLocaleDateString(undefined, { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      })
    );
  }, []);

  return (
    <main className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onAddHabit={() => setIsAddModalOpen(true)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="text-lg font-bold text-slate-800 dark:text-white">
            {currentView === "tracker" ? "Habit Tracker" : "Analytics"}
          </h1>
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {formattedDate}
          </div>
        </header>

        <div className={`flex-1 overflow-auto ${currentView === 'analytics' ? '' : ''}`}>
          {currentView === "tracker" ? (
            <div className="h-full bg-white dark:bg-slate-900 overflow-hidden">
              <MonthlyView />
            </div>
          ) : (
            <div className="h-full">
              <AnalyticsView />
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Habit"
      >
        <AddHabitForm onSuccess={() => setIsAddModalOpen(false)} />
      </Modal>
    </main>
  );
}
