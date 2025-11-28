"use client";

import { useTheme } from "@/contexts/ThemeContext";

interface SidebarProps {
  currentView: "tracker" | "analytics";
  setCurrentView: (view: "tracker" | "analytics") => void;
  onAddHabit: () => void;
}

export default function Sidebar({ currentView, setCurrentView, onAddHabit }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="w-20 lg:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full transition-all duration-300">
      {/* Logo / Header */}
      <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
          H
        </div>
        <span className="hidden lg:block ml-3 font-bold text-xl text-gray-800 dark:text-white">
          Habitify
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={() => setCurrentView("tracker")}
          className={`w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-3 rounded-xl transition-all ${
            currentView === "tracker"
              ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
          title="Tracker"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span className="hidden lg:block">Tracker</span>
        </button>

        <button
          onClick={() => setCurrentView("analytics")}
          className={`w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-3 rounded-xl transition-all ${
            currentView === "analytics"
              ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
          title="Analytics"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          <span className="hidden lg:block">Analytics</span>
        </button>
      </nav>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
        <button
          onClick={onAddHabit}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none group"
          title="Add Habit"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:rotate-90 transition-transform">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span className="hidden lg:block font-medium">New Habit</span>
        </button>

        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
          title="Toggle Theme"
        >
          {theme === "light" ? (
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <span className="hidden lg:block">
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </span>
        </button>
      </div>
    </div>
  );
}

