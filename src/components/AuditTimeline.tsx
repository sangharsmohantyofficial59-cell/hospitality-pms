import React, { useState } from "react";
import { LogIn, PlusCircle, LogOut, Tag, FileClock, CheckSquare, DollarSign, Search, ShieldCheck } from "lucide-react";

interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  icon?: string;
}

interface AuditTimelineProps {
  activityLogs: ActivityLog[];
}

export default function AuditTimeline({ activityLogs = [] }: AuditTimelineProps) {
  const [filterAction, setFilterAction] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Map icons
  const getIcon = (action: string, customIcon?: string) => {
    const act = action.toLowerCase();
    if (act.includes("login")) return <LogIn className="w-4 h-4 text-sky-500" />;
    if (act.includes("reservation") || act.includes("booking") || act.includes("creation")) {
      return <PlusCircle className="w-4 h-4 text-emerald-500" />;
    }
    if (act.includes("room") || act.includes("assignment")) return <CheckSquare className="w-4 h-4 text-amber-500" />;
    if (act.includes("discount") || act.includes("rebate")) return <Tag className="w-4 h-4 text-pink-500" />;
    if (act.includes("invoice") || act.includes("generation")) return <FileClock className="w-4 h-4 text-indigo-500" />;
    if (act.includes("payment") || act.includes("collection") || act.includes("paid")) {
      return <DollarSign className="w-4 h-4 text-green-600" />;
    }
    if (act.includes("checkout") || act.includes("out")) return <LogOut className="w-4 h-4 text-purple-600" />;
    return <ShieldCheck className="w-4 h-4 text-stone-500" />;
  };

  const getEventCategory = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes("login")) return "Login Event";
    if (act.includes("creation") || act.includes("reservation")) return "Reservation Creation";
    if (act.includes("room") || act.includes("assignment")) return "Room Assignment";
    if (act.includes("discount")) return "Discounts Applied";
    if (act.includes("invoice")) return "Invoice Generation";
    if (act.includes("payment") || act.includes("collection") || act.includes("paid") || act.includes("settle")) return "Payment Collection";
    if (act.includes("checkout") || act.includes("out")) return "Checkout Events";
    return "Operations Audit";
  };

  // Unique users lists
  const availableCategories = [
    "All",
    "Login Event",
    "Reservation Creation",
    "Room Assignment",
    "Discounts Applied",
    "Invoice Generation",
    "Payment Collection",
    "Checkout Events"
  ];

  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());

    const cat = getEventCategory(log.action);
    const matchesCategory = filterAction === "All" || cat === filterAction;

    return matchesSearch && matchesCategory;
  });

  return (
    <div id="owner-audit-timeline-module" className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm font-sans text-stone-700">
      
      {/* Timeline Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-100 pb-4 mb-6 gap-4">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <FileClock className="w-5 h-5 text-indigo-600" /> Executive Security Audit Ledger & Timeline
          </h2>
          <p className="text-stone-500 text-xs mt-0.5">
            Real-time tracking of staff actions, financial write-offs, room assignments, and front-desk transitions.
          </p>
        </div>

        {/* Total stats breakdown */}
        <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/50 flex gap-4 text-center font-mono text-[10px]">
          <div>
            <span className="text-stone-400 block uppercase">Total Entries</span>
            <strong className="text-stone-800 text-xs">{activityLogs.length}</strong>
          </div>
          <div className="border-r border-stone-200"></div>
          <div>
            <span className="text-stone-400 block uppercase">Filtered</span>
            <strong className="text-indigo-600 text-xs">{filteredLogs.length}</strong>
          </div>
        </div>
      </div>

      {/* Timeline Control Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6 items-center">
        
        {/* Keyword Search */}
        <div className="md:col-span-4 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search auditor, actions or folio reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
          />
        </div>

        {/* Action categories row */}
        <div className="md:col-span-8 flex flex-wrap gap-1.5 overflow-x-auto py-1">
          {availableCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterAction(cat)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold font-mono transition-all cursor-pointer whitespace-nowrap ${
                filterAction === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-stone-105 bg-stone-100 hover:bg-stone-200 text-stone-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 border-l-2 border-stone-200 flex flex-col gap-6 ml-3">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-stone-400 font-mono text-xs italic">
            Zero logs found matching the filters or keywords specified.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const cat = getEventCategory(log.action);
            return (
              <div key={log.id} className="relative group">
                
                {/* Timeline node circle logo */}
                <div className="absolute -left-10 top-0.5 w-7 h-7 rounded-full bg-white border border-stone-200 flex items-center justify-center shadow-sm select-none">
                  {getIcon(log.action, log.icon)}
                </div>

                {/* Log timeline card details */}
                <div className="bg-stone-50 hover:bg-stone-100 p-4 rounded-xl border border-stone-200/50 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  
                  <div className="flex-grow select-text">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="font-mono text-[10px] bg-stone-200 px-1.5 py-0.5 rounded text-stone-600 font-bold uppercase select-none">
                        {log.id}
                      </span>
                      <strong className="text-stone-900 text-xs font-bold leading-tight">
                        {log.action}
                      </strong>
                      <span className="text-slate-400 font-mono text-[9px]">
                        via {log.user}
                      </span>
                    </div>
                    
                    <p className="text-stone-600 text-[11.5px] mt-1.5 leading-relaxed font-sans max-w-2xl">
                      {log.details}
                    </p>
                  </div>

                  {/* Date and dynamic labels */}
                  <div className="flex flex-col items-end sm:items-end flex-shrink-0 text-right">
                    <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full font-bold select-none uppercase font-mono">
                      {cat}
                    </span>
                    <span className="text-[9px] text-stone-400 font-mono mt-2">
                      {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
