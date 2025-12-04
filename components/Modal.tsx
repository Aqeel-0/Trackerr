"use client";

import { useEffect, useRef, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  contentClassName?: string;
}

export default function Modal({ isOpen, onClose, title, children, contentClassName }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`bg-white dark:bg-slate-800 shadow-2xl w-full border border-slate-200 dark:border-slate-700 flex flex-col ${isMobile
            ? 'rounded-t-3xl animate-slide-up h-[80vh]'
            : 'rounded-2xl animate-scale-in max-w-lg max-h-[85vh]'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {isMobile && (
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
          </div>
        )}

        <div className={`flex items-center justify-between border-b border-slate-200 dark:border-slate-700 flex-shrink-0 ${isMobile ? 'px-5 py-3' : 'p-5'
          }`}>
          <h2 className={`font-bold text-slate-900 dark:text-white ${isMobile ? 'text-lg' : 'text-xl'
            }`}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className={contentClassName || `flex-1 min-h-0 overflow-y-auto safe-bottom ${isMobile ? 'p-5' : 'p-6'}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
