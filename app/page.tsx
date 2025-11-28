"use client";

import { useState, useEffect } from "react";
import AddHabitForm from "@/components/AddHabitForm";
import MonthlyView from "@/components/MonthlyView";
import AnalyticsView from "@/components/AnalyticsView";
import Sidebar from "@/components/Sidebar";
import Modal from "@/components/Modal";

export default function Home() {
  const [currentView, setCurrentView] = useState<"tracker" | "analytics">("tracker");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    setFormattedDate(
      new Date().toLocaleDateString(undefined, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    );
  }, []);

  return (
    <main className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onAddHabit={() => setIsAddModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header - Optional, for page titles or dates */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {currentView === "tracker" ? "Habit Tracker" : "Analytics Dashboard"}
          </h1>
          <div className="text-sm text-gray-500 dark:text-gray-400 min-h-[20px]">
            {formattedDate}
          </div>
        </header>

        {/* Content */}
        <div className={`flex-1 overflow-auto ${currentView === 'analytics' ? 'p-4 lg:p-6' : ''}`}>
          {currentView === "tracker" ? (
            <div className="h-full bg-white dark:bg-gray-800 shadow-sm border-l border-gray-200 dark:border-gray-700 overflow-hidden">
              <MonthlyView />
            </div>
          ) : (
            <div className="h-full">
              <AnalyticsView />
            </div>
          )}
        </div>
      </div>

      {/* Add Habit Modal */}
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
