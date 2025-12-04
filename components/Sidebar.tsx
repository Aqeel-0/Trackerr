"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";

interface SidebarProps {
  currentView: "tracker" | "analytics" | "profile";
  setCurrentView: (view: "tracker" | "analytics" | "profile") => void;
  onAddHabit: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function Sidebar({ 
  currentView, 
  setCurrentView, 
  onAddHabit,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = (view: "tracker" | "analytics" | "profile") => {
    if (view === "profile") {
      router.push('/profile');
    } else if (view === "analytics") {
      router.push('/analytics');
    } else {
      router.push('/');
    }
    setIsMobileMenuOpen(false);
  };

  const handleAddHabit = () => {
    onAddHabit();
    setIsMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    router.push('/profile');
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-20 xl:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col h-full transition-all duration-300 fixed left-0 top-0 z-30">
        <div className="h-16 flex items-center justify-center xl:justify-start xl:px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white dark:text-black">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <span className="hidden xl:block ml-3 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Trackerr
          </span>
        </div>

        <nav className="flex-1 p-3 xl:px-6 xl:py-4 space-y-1">
          <button
            onClick={() => handleNavClick("tracker")}
            className={`w-full flex items-center justify-center xl:justify-start gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${currentView === "tracker"
                ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
            title="Tracker"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1"></rect>
            </svg>
            <span className="hidden xl:block font-medium">Tracker</span>
          </button>

          <button
            onClick={() => handleNavClick("analytics")}
            className={`w-full flex items-center justify-center xl:justify-start gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${currentView === "analytics"
                ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
            title="Analytics"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18"></path>
              <path d="M18 17V9"></path>
              <path d="M13 17V5"></path>
              <path d="M8 17v-3"></path>
            </svg>
            <span className="hidden xl:block font-medium">Analytics</span>
          </button>

          <button
            onClick={handleProfileClick}
            className={`w-full flex items-center justify-center xl:justify-start gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${currentView === "profile"
                ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            title="Profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span className="hidden xl:block font-medium">Profile</span>
          </button>
        </nav>

        <div className="p-3 xl:px-6 xl:py-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onAddHabit}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white p-3 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.98] group"
            title="Add Habit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:rotate-90 transition-transform duration-200">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span className="hidden xl:block font-semibold">New Habit</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-out Menu */}
      <div className={`md:hidden fixed inset-y-0 right-0 w-[280px] bg-white dark:bg-slate-900 z-50 transform transition-transform duration-300 ease-out shadow-2xl ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="flex flex-col h-full safe-top safe-bottom">
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white dark:text-black">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <span className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                Trackerr
              </span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 -mr-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-4 py-2">
              Menu
            </div>
            
            <button
              onClick={() => handleNavClick("tracker")}
              className={`mobile-nav-item w-full ${currentView === "tracker" ? "mobile-nav-item-active" : ""}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1"></rect>
              </svg>
              <span>Tracker</span>
            </button>

            <button
              onClick={() => handleNavClick("analytics")}
              className={`mobile-nav-item w-full ${currentView === "analytics" ? "mobile-nav-item-active" : ""}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18"></path>
                <path d="M18 17V9"></path>
                <path d="M13 17V5"></path>
                <path d="M8 17v-3"></path>
              </svg>
              <span>Analytics</span>
            </button>

            <button
              onClick={handleProfileClick}
              className="mobile-nav-item w-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Profile</span>
            </button>

            <div className="pt-4">
              <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-4 py-2">
                Actions
              </div>
              <button
                onClick={handleAddHabit}
                className="mobile-nav-item w-full text-indigo-600 dark:text-indigo-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Add New Habit</span>
              </button>
            </div>
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-400 dark:text-slate-500 text-center">
              Trackerr v1.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
