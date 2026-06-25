/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Globe, ArrowRight, Shield, Sparkles, AlertCircle } from "lucide-react";

interface SubdomainSimulatorProps {
  currentRoute: string; // "home" | "guest" | "ops" | "owner"
  onNavigate: (route: string) => void;
}

export default function SubdomainSimulator({ currentRoute, onNavigate }: SubdomainSimulatorProps) {
  const options = [
    {
      id: "home",
      domain: "bharattravels.online",
      path: "/",
      title: "Public Website",
      badge: "GUEST LANDING",
      color: "border-indigo-500 text-indigo-700 bg-indigo-50 dark:bg-indigo-950/20 dark:text-indigo-400",
      dot: "bg-indigo-500",
      description: "Direct guest lodging reservations, rooms gallery, and travel search inquiries"
    },
    {
      id: "guest",
      domain: "guest.bharattravels.online",
      path: "/guest",
      title: "Guest Experience Hub",
      badge: "GUEST WORKSPACE",
      color: "border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400",
      dot: "bg-amber-500",
      description: "Concierge orders, digital check-in uploads, invoice reviews, and stay ratings"
    },
    {
      id: "ops",
      domain: "ops.bharattravels.online",
      path: "/ops",
      title: "Operations Console",
      badge: "FRONT DESK & TAX QUEUE",
      color: "border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400",
      dot: "bg-emerald-500",
      description: "Room status board, live booking registers, checkin logs, transport logistics"
    },
    {
      id: "owner",
      domain: "owner.bharattravels.online",
      path: "/owner",
      title: "Owner Analytics Portal",
      badge: "C-SUITE REVENUE",
      color: "border-purple-500 text-purple-700 bg-purple-50 dark:bg-purple-950/20 dark:text-purple-400",
      dot: "bg-purple-500",
      description: "C-Suite occupancy metrics, revenue stream breakdowns, discount governance audit"
    }
  ];

  return (
    <div className="bg-slate-900 text-white border-b border-indigo-500/20">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-650 text-white rounded-lg animate-pulse">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs tracking-wide uppercase font-sans">Bharat Travels Deployment Sandbox</span>
                <span className="bg-slate-800 text-[9px] font-bold text-amber-405 border border-amber-500/30 px-1.5 py-0.5 rounded uppercase font-mono">Simulated Multi-Domain Routing</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Click a mock subdomain link below to test isolated route states and auto-authenticate respective actors.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 w-full lg:w-auto">
            {options.map((opt) => {
              const isActive = currentRoute === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => onNavigate(opt.id)}
                  className={`p-2 rounded-xl text-left border transition-all flex flex-col justify-between h-auto cursor-pointer relative group ${
                    isActive
                      ? "bg-slate-950 border-indigo-500 shadow-lg ring-1 ring-indigo-500/30"
                      : "bg-slate-850/50 border-slate-800 hover:bg-slate-850 hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="font-mono text-[9px] tracking-widest uppercase font-bold text-slate-400">
                      {opt.badge}
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${opt.dot} ${isActive ? "animate-ping" : "opacity-40"}`} />
                  </div>

                  <div className="mt-1">
                    <span className={`text-[11px] font-bold block ${isActive ? "text-white" : "text-slate-350"}`}>
                      {opt.domain}
                    </span>
                    <span className="text-[9.5px] text-slate-400 font-mono block">
                      Ref: {opt.path}
                    </span>
                  </div>

                  {isActive && (
                    <div className="absolute right-2 bottom-2 bg-indigo-600 text-white rounded-full p-0.5">
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
