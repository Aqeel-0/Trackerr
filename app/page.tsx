"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import AddHabitForm from "@/components/AddHabitForm";
import MonthlyView from "@/components/MonthlyView";
import Sidebar from "@/components/Sidebar";
import Modal from "@/components/Modal";
import ProfileMenu from "@/components/ProfileMenu";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

const AnalyticsView = dynamic(() => import("@/components/AnalyticsView"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <div className="animate-pulse text-slate-400">Loading analytics...</div>
    </div>
  ),
});

function HomeContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialView = searchParams.get('view') as "tracker" | "analytics" | null;
  const [currentView, setCurrentView] = useState<"tracker" | "analytics">(initialView === "analytics" ? "analytics" : "tracker");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formattedDate, setFormattedDate] = useState("");
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    setFormattedDate(
      new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      })
    );
  }, []);

  const handleSetView = (view: "tracker" | "analytics" | "profile") => {
    if (view === "profile") {
      router.push('/profile');
    } else {
      setCurrentView(view);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex">
      <Sidebar
        currentView={currentView}
        setCurrentView={handleSetView}
        onAddHabit={() => setIsAddModalOpen(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden md:ml-20 xl:ml-64 transition-all duration-300">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button - Left side */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 dark:text-slate-300">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>

            <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
              {currentView === "tracker" ? "Habit Tracker" : "Analytics"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 font-medium">
              {formattedDate}
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              )}
            </button>

            <ProfileMenu />
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {currentView === "tracker" ? (
            <div className="h-full pb-16 md:pb-0 bg-white dark:bg-slate-900">
              <MonthlyView />
            </div>
          ) : (
            <div className="h-full pb-16 md:pb-0 overflow-auto">
              <AnalyticsView />
            </div>
          )}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-30">
          <div className="flex items-center justify-around h-16 px-4 relative">
            {/* Logo/Brand */}
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
              T
            </div>

            {/* Tracker Tab */}
            <button
              onClick={() => setCurrentView("tracker")}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl transition-all ${currentView === "tracker"
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-400 dark:text-slate-500"
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1"></rect>
              </svg>
              <span className="text-xs font-medium">Tracker</span>
            </button>

            {/* Center Add Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-full shadow-lg shadow-indigo-500/40 flex items-center justify-center active:scale-95 transition-transform -mt-6"
              aria-label="Add new habit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>

            {/* Analytics Tab */}
            <button
              onClick={() => setCurrentView("analytics")}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl transition-all ${currentView === "analytics"
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-400 dark:text-slate-500"
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18"></path>
                <path d="M18 17V9"></path>
                <path d="M13 17V5"></path>
                <path d="M8 17v-3"></path>
              </svg>
              <span className="text-xs font-medium">Analytics</span>
            </button>

            {/* Empty space to balance layout */}
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Habit"
        contentClassName="flex-1 flex flex-col overflow-hidden p-0"
      >
        <AddHabitForm onSuccess={() => setIsAddModalOpen(false)} />
      </Modal>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
