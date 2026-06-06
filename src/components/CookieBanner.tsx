"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-50 p-4 md:p-6 shadow-2xl animate-fade-in">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-slate-300 text-sm max-w-3xl">
          <p className="mb-2"><strong className="text-slate-100 text-base">We Value Your Privacy</strong></p>
          <p>
            We use strictly necessary cookies to make our layout planner work. We also use minor analytics cookies to help us improve the planner. No login is required, and everything is saved locally on your device. For more detailed information, see our{" "}
            <Link href="/cookies" className="text-blue-400 hover:text-blue-300 hover:underline">
              Cookie Policy
            </Link>.
          </p>
        </div>
        <div className="flex flex-row gap-3 shrink-0 w-full md:w-auto">
          <button
            onClick={handleReject}
            className="flex-1 md:flex-none border border-slate-700 hover:border-slate-500 text-slate-300 font-medium py-2 px-5 rounded-lg transition-colors text-sm text-center"
          >
            Reject Optional
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 md:flex-none bg-blue-600 text-white font-medium py-2 px-5 hover:bg-blue-500 rounded-lg transition-colors text-sm text-center"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
