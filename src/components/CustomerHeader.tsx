/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { Hotel, KeyRound, Search, CalendarPlus, UserCheck, Sun, Moon } from "lucide-react";
import { hotelConfig } from "../config/hotelConfig";

interface CustomerHeaderProps {
  currentTab: string;
  setTab: (tab: string) => void;
  onAdminClick: () => void;
  onMyStayClick: () => void;
  bookingCounts: number;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export default function CustomerHeader({ currentTab, setTab, onAdminClick, onMyStayClick, bookingCounts, theme, onToggleTheme }: CustomerHeaderProps) {
  // Dynamically update document head tags from SEO configuration
  useEffect(() => {
    if (hotelConfig?.seo) {
      document.title = hotelConfig.seo.pageTitle;
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', hotelConfig.seo.metaDescription);

      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', hotelConfig.seo.keywords.join(", "));
    }
  }, []);
  return (
    <header id="customer-header" className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Brand */}
          <div 
            id="brand-logo"
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setTab("home")}
          >
            <div className="p-2.5 bg-amber-600 text-white rounded-xl shadow-md shadow-amber-500/20 group-hover:bg-amber-700 transition-colors">
              <Hotel className="w-6 h-6" />
            </div>
            <div>
              <span className="font-serif font-bold text-xl tracking-wide text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                {hotelConfig.info.name}
              </span>
              <p className="font-mono text-[9px] font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase mt-0.5">
                {hotelConfig.info.tagline}
              </p>
            </div>
          </div>

          {/* Nav Items - Redesigned Mayfair Luxury List */}
          <nav id="customer-navigation" className="hidden lg:flex items-center gap-1">
            {[
              { id: "home", label: "Home" },
              { id: "rooms", label: "Rooms & Suites" },
              { id: "dining", label: "Dining" },
              { id: "explore", label: "Experiences" },
              { id: "locality", label: `Explore ${hotelConfig.destinationExplorer?.localityName || "Locality"}` },
              { id: "gallery", label: "Gallery" },
              { id: "offers", label: "Offers" },
              { id: "contact", label: "Contact" }
            ].map(item => (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setTab(item.id)}
                className={`px-3 py-2 text-sm font-semibold tracking-wide transition-all rounded-lg relative ${
                  currentTab === item.id
                    ? "text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                {item.label}
                {currentTab === item.id && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-amber-500 rounded-full animate-fade-in" />
                )}
              </button>
            ))}
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Elegant light/dark mode switch */}
            <button
              onClick={onToggleTheme}
              className="p-2 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </button>

            {/* My Stay */}
            <button
              id="btn-mystay"
              onClick={onMyStayClick}
              className="px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4 text-amber-500" />
              <span>My Stay</span>
            </button>

            {/* Staff Login */}
            <button
              id="btn-admin-portal"
              onClick={onAdminClick}
              className="flex items-center gap-1.5 px-2.5 py-2 sm:px-3 sm:py-2 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-medium hover:bg-slate-50/80 dark:hover:bg-slate-800 transition-all font-semibold cursor-pointer"
              title="Admin PMS Panel"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-500 dark:text-amber-405" />
              <span className="hidden sm:inline">Staff Login</span>
            </button>

            {/* Book Your Stay (Primary CTA) */}
            <button
              id="btn-book-now-header"
              onClick={() => setTab("booking")}
              className="px-4 py-2 bg-amber-600 text-white dark:text-slate-950 dark:bg-amber-400 dark:hover:bg-amber-500 rounded-lg text-sm font-bold shadow-sm hover:bg-amber-700 transition-all hover:shadow-md cursor-pointer"
            >
              Book Your Stay
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bar - fixed at the bottom of the viewport for native mobile UX */}
      <div className="md:hidden fixed bottom-1.5 left-2.5 right-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/80 py-2 text-slate-600 dark:text-slate-400 px-2 rounded-2xl select-none z-50 shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center justify-around">
        <button
          onClick={() => setTab("home")}
          className={`flex flex-col items-center gap-1.5 text-[10px] font-medium transition-all ${
            currentTab === "home" ? "text-amber-600 font-bold dark:text-amber-400 scale-105" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <span className="text-base leading-none">🏡</span>
          <span>Home</span>
        </button>
        <button
          onClick={() => setTab("rooms")}
          className={`flex flex-col items-center gap-1.5 text-[10px] font-medium transition-all ${
            currentTab === "rooms" ? "text-amber-605 font-bold dark:text-amber-400 scale-105" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <span className="text-base leading-none">🛏️</span>
          <span>Suites</span>
        </button>
        <button
          onClick={() => setTab("booking")}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-all ${
            currentTab === "booking" ? "text-amber-606 font-bold dark:text-amber-400 scale-105" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <CalendarPlus className="w-4 h-4 text-amber-500" />
          <span>Book</span>
        </button>
        <button
          onClick={onMyStayClick}
          className="flex flex-col items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400"
        >
          <UserCheck className="w-4 h-4 text-amber-550" />
          <span>My Stay</span>
        </button>
      </div>
    </header>
  );
}
