/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Bell, BellOff, Coffee, Brush, Key, Clock, ShieldAlert, AlertCircle, 
  CheckCircle2, User, HelpCircle, Compass, Truck, Search, Play, Volume2, 
  VolumeX, Check, UserPlus, Zap, AlertTriangle, RefreshCw
} from "lucide-react";

// Web Audio API Sound Synthesizer for alerts
export function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Pleasant dual chime
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (err) {
    console.warn("AudioContext was blocked or is not supported:", err);
  }
}

interface LiveServiceCenterProps {
  serviceRequests: any[];
  onUpdateServiceRequest: (id: string, payload: any) => Promise<void>;
  onRefresh?: () => Promise<void>;
}

// Categories definitions
const CATEGORY_SLAS: { [key: string]: number } = {
  "Food & Beverage": 20,
  "Housekeeping": 15,
  "Laundry": 120,
  "Maintenance": 15,
  "Concierge": 30,
  "Transport": 15,
  "Early Check-In": 10,
  "Late Check-Out": 15,
  "Wake-Up Call": 5,
  "Custom Guest Requests": 30
};

const CATEGORIES = [
  "Food & Beverage",
  "Housekeeping",
  "Laundry",
  "Maintenance",
  "Concierge",
  "Transport",
  "Early Check-In",
  "Late Check-Out",
  "Wake-Up Call",
  "Custom Guest Requests"
];

const STAFF_MEMBERS = [
  "Rajesh Kumar (Front Desk)",
  "Amit Patel (Housekeeping Lead)",
  "Pooja Hegde (F&B Director)",
  "Vikram Singh (Concierge Chief)",
  "Ramesh Rao (Maintenance Lead)",
  "Maya Sen (Laundry Executive)"
];

export default function LiveServiceCenter({
  serviceRequests = [],
  onUpdateServiceRequest,
  onRefresh
}: LiveServiceCenterProps) {
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedPriority, setSelectedPriority] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Alert system state
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const prevRequestsRef = useRef<any[]>([]);

  // Timer tick for SLAs
  const [tick, setTick] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 15000); // refresh SLA times every 15 seconds
    return () => clearInterval(timer);
  }, []);

  // Track new requests for the real-time alerting system
  useEffect(() => {
    if (prevRequestsRef.current.length > 0 && serviceRequests.length > prevRequestsRef.current.length) {
      // Find what requests are new
      const prevIds = new Set(prevRequestsRef.current.map(r => r.id));
      const newRequests = serviceRequests.filter(r => !prevIds.has(r.id));
      
      if (newRequests.length > 0) {
        if (!isMuted) {
          playNotificationSound();
        }
        
        // Add to active banner alerts
        setActiveAlerts(prev => [...newRequests, ...prev]);
      }
    }
    prevRequestsRef.current = serviceRequests;
  }, [serviceRequests, isMuted]);

  const dismissAlert = (id: string) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== id));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Food & Beverage": return <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case "Housekeeping": return <Brush className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case "Laundry": return <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case "Maintenance": return <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case "Concierge": return <Compass className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
      case "Transport": return <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case "Early Check-In": return <Key className="w-4 h-4 text-pink-600 dark:text-pink-400" />;
      case "Late Check-Out": return <Clock className="w-4 h-4 text-amber-700 dark:text-amber-500" />;
      case "Wake-Up Call": return <Bell className="w-4 h-4 text-violet-600 dark:text-violet-400" />;
      default: return <HelpCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent": return "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900";
      case "High": return "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900";
      case "Medium": return "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900";
      default: return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-400 border-slate-200 dark:border-slate-800";
    }
  };

  // Filter logic
  const filteredRequests = serviceRequests.filter(req => {
    const matchesCategory = selectedCategory === "All" || req.category === selectedCategory || (selectedCategory === "Custom Guest Requests" && !req.category);
    const matchesStatus = selectedStatus === "All" || req.status === selectedStatus;
    const matchesPriority = selectedPriority === "All" || req.priority === selectedPriority;
    
    const term = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      (req.id || "").toLowerCase().includes(term) ||
      (req.guestName || "").toLowerCase().includes(term) ||
      (req.roomId || "").toLowerCase().includes(term) ||
      (req.bookingId || "").toLowerCase().includes(term) ||
      (req.requestType || "").toLowerCase().includes(term) ||
      (req.comments || req.description || "").toLowerCase().includes(term);

    return matchesCategory && matchesStatus && matchesPriority && matchesSearch;
  });

  // Calculate SLA status
  const getSLAStatus = (req: any) => {
    if (req.status === "Completed") {
      const start = new Date(req.timestamp || req.createdTime || Date.now());
      const end = new Date(req.completionTime || Date.now());
      const diffMins = Math.round((end.getTime() - start.getTime()) / 60000);
      return {
        label: `Resolved in ${diffMins} mins`,
        isBreached: false,
        isCompleted: true,
        minutesLeft: 0
      };
    }

    const createdTime = new Date(req.timestamp || req.createdTime || Date.now());
    const targetMins = CATEGORY_SLAS[req.category || "Custom Guest Requests"] || 30;
    const deadline = new Date(createdTime.getTime() + targetMins * 60000);
    const now = new Date();
    
    const minutesLeft = Math.round((deadline.getTime() - now.getTime()) / 60000);
    
    if (minutesLeft < 0) {
      return {
        label: `SLA Breached (${Math.abs(minutesLeft)}m ago)`,
        isBreached: true,
        isCompleted: false,
        minutesLeft
      };
    } else {
      return {
        label: `${minutesLeft} mins remaining`,
        isBreached: false,
        isCompleted: false,
        minutesLeft
      };
    }
  };

  // Handle advancing status workflow
  const handleAdvanceWorkflow = async (req: any) => {
    let nextStatus = "Pending";
    let payload: any = {};

    switch (req.status) {
      case "Pending":
        nextStatus = "Accepted";
        break;
      case "Accepted":
        nextStatus = "Assigned";
        payload.assignedStaff = STAFF_MEMBERS[0]; // Auto-assign default
        break;
      case "Assigned":
        nextStatus = "In Progress";
        break;
      case "In Progress":
        nextStatus = "Completed";
        break;
      default:
        return;
    }

    payload.status = nextStatus;
    payload.operatorName = "Operations Desk";
    await onUpdateServiceRequest(req.id, payload);
  };

  return (
    <div id="live-service-center-root" className="space-y-6 text-xs text-left p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      
      {/* Real-time Toast/Alert Banner */}
      {activeAlerts.length > 0 && (
        <div className="space-y-2">
          {activeAlerts.map(alert => (
            <div 
              key={alert.id}
              className="bg-amber-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg border border-amber-550 animate-bounce"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Bell className="w-5 h-5 animate-swing" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">🔔 NEW REQUEST SUBMITTED!</span>
                    <span className="font-mono text-[10px] bg-white/20 px-1.5 py-0.5 rounded uppercase font-bold">{alert.id}</span>
                  </div>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    <strong>Room {alert.roomId}</strong> ({alert.guestName}) requested: <strong>{alert.requestType}</strong>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleAdvanceWorkflow(alert).then(() => dismissAlert(alert.id))}
                  className="px-3 py-1.5 bg-white text-amber-700 hover:bg-slate-100 font-bold rounded-lg transition-colors text-[10px] cursor-pointer"
                >
                  Accept & Acknowledge ✓
                </button>
                <button 
                  onClick={() => dismissAlert(alert.id)}
                  className="text-white hover:text-slate-200 text-xs font-bold px-2 py-1 bg-transparent border-none cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-805 rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded">
              SLA RADAR CONTROL
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[9px] text-slate-400 uppercase font-semibold">LIVE CONNECTED</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            🛎️ Live Guest Service Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            Monitor, assign, and track hotel guest service requests against pre-configured resort SLAs in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              playNotificationSound();
            }}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            title="Test Chime Sound"
          >
            <Volume2 className="w-4 h-4" />
            <span className="text-[10px] font-bold">Test Chime</span>
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              isMuted 
                ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600" 
                : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700"
            }`}
            title={isMuted ? "Unmute sound alerts" : "Mute sound alerts"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="text-[10px] font-bold">{isMuted ? "Muted" : "Alert On"}</span>
          </button>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-[10px] font-bold">Sync State</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-805 rounded-3xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-450">
              <Search className="w-4 h-4" />
            </span>
            <input 
              type="text"
              placeholder="Search ID, room, guest, request..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-450 focus:outline-none focus:border-amber-505"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-1">
            <label className="font-bold text-[10px] text-slate-400 uppercase tracking-wide">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            >
              <option value="All">All Categories ({serviceRequests.length})</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat} ({serviceRequests.filter(r => r.category === cat || (cat === "Custom Guest Requests" && !r.category)).length})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col gap-1">
            <label className="font-bold text-[10px] text-slate-400 uppercase tracking-wide">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending ({serviceRequests.filter(r => r.status === "Pending").length})</option>
              <option value="Accepted">Accepted ({serviceRequests.filter(r => r.status === "Accepted").length})</option>
              <option value="Assigned">Assigned ({serviceRequests.filter(r => r.status === "Assigned").length})</option>
              <option value="In Progress">In Progress ({serviceRequests.filter(r => r.status === "In Progress").length})</option>
              <option value="Completed">Completed ({serviceRequests.filter(r => r.status === "Completed").length})</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex flex-col gap-1">
            <label className="font-bold text-[10px] text-slate-400 uppercase tracking-wide">Priority</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">🚨 Urgent</option>
              <option value="High">🔥 High</option>
              <option value="Medium">⚡ Medium</option>
              <option value="Low">💤 Low</option>
            </select>
          </div>

        </div>

        {/* Dynamic status count summary ribbon */}
        <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800/60">
          <span className="font-bold">Summary Radar:</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pending: <strong>{serviceRequests.filter(r => r.status === "Pending").length}</strong></span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Accepted: <strong>{serviceRequests.filter(r => r.status === "Accepted").length}</strong></span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Assigned: <strong>{serviceRequests.filter(r => r.status === "Assigned").length}</strong></span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> In Progress: <strong>{serviceRequests.filter(r => r.status === "In Progress").length}</strong></span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed: <strong>{serviceRequests.filter(r => r.status === "Completed").length}</strong></span>
          <span className="ml-auto text-[9px] bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded text-slate-450">Displaying: {filteredRequests.length} of {serviceRequests.length} tickets</span>
        </div>
      </div>

      {/* Requests Display Section */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-805 rounded-3xl p-16 text-center text-slate-450 italic">
          <CheckCircle2 className="w-12 h-12 text-slate-305 mx-auto mb-3" />
          No active guest service requests found matching the active filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredRequests.map(req => {
            const sla = getSLAStatus(req);
            
            return (
              <div 
                key={req.id}
                className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 sm:p-6 transition-all duration-350 hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                  req.status === "Completed" 
                    ? "border-slate-200 dark:border-slate-850 opacity-80" 
                    : sla.isBreached 
                      ? "border-rose-300 dark:border-rose-950 shadow-rose-100/10 dark:shadow-rose-950/5 shadow-md bg-rose-50/10 dark:bg-rose-950/5"
                      : "border-slate-205 dark:border-slate-805"
                }`}
              >
                {/* Left block details */}
                <div className="space-y-3 max-w-xl text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-slate-500 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                      {req.id}
                    </span>
                    
                    <span className="flex items-center gap-1 font-sans font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 px-2 py-0.5 rounded-lg text-[10px]">
                      {getCategoryIcon(req.category || "Custom Guest Requests")}
                      <span>{req.category || "Custom Guest Requests"}</span>
                    </span>

                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold uppercase border ${getPriorityColor(req.priority || "Medium")}`}>
                      {req.priority || "Medium"} Priority
                    </span>

                    {/* SLA Status Indicator */}
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold uppercase border ${
                      req.status === "Completed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400"
                        : sla.isBreached
                          ? "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/30 dark:text-rose-400 animate-pulse"
                          : sla.minutesLeft <= 5
                            ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/20 dark:text-amber-400 animate-pulse"
                            : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    }`}>
                      🕒 {sla.label}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Room {req.roomId} • {req.requestType}
                    </h4>
                    <p className="text-[11.5px] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-150 dark:border-slate-850/60 leading-relaxed font-mono italic">
                      "{req.comments || req.description || "No specific comments added by guest"}"
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-[10px] font-mono text-slate-500">
                    <span>Guest: <strong className="text-slate-700 dark:text-slate-300 font-sans">{req.guestName}</strong></span>
                    <span>Booking Ref: <strong className="text-slate-705 dark:text-slate-305">{req.bookingId}</strong></span>
                    <span>Created: <strong>{new Date(req.timestamp || req.createdTime || Date.now()).toLocaleTimeString()} ({new Date(req.timestamp || req.createdTime || Date.now()).toLocaleDateString()})</strong></span>
                    {req.status === "Completed" && req.completionTime && (
                      <span className="text-emerald-600 font-bold">Resolved: {new Date(req.completionTime).toLocaleTimeString()}</span>
                    )}
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-4 min-w-[210px]">
                  
                  {/* Status Indicator Stepper Banner */}
                  <div className="w-full space-y-1">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wide block text-left">
                      Staff Assigned:
                    </span>
                    <select
                      value={req.assignedStaff || "Unassigned"}
                      onChange={async (e) => {
                        const nextStaff = e.target.value;
                        const payload: any = { assignedStaff: nextStaff };
                        // If they select a real staff, and the status was Pending or Accepted, move to Assigned
                        if (nextStaff !== "Unassigned" && (req.status === "Pending" || req.status === "Accepted")) {
                          payload.status = "Assigned";
                        }
                        payload.operatorName = "Operations Desk";
                        await onUpdateServiceRequest(req.id, payload);
                      }}
                      className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-mono"
                    >
                      <option value="Unassigned">👤 Unassigned</option>
                      {STAFF_MEMBERS.map(staff => (
                        <option key={staff} value={staff}>{staff}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status update selector or stepper button */}
                  <div className="w-full flex flex-col gap-1.5">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wide block text-left">
                      Workflow Actions:
                    </span>
                    
                    <div className="flex gap-1">
                      {req.status === "Pending" && (
                        <button
                          onClick={() => handleAdvanceWorkflow(req)}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10.5px] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept Ticket</span>
                        </button>
                      )}
                      
                      {req.status === "Accepted" && (
                        <button
                          onClick={() => handleAdvanceWorkflow(req)}
                          className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-[10.5px] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Assign Staff Lead</span>
                        </button>
                      )}

                      {req.status === "Assigned" && (
                        <button
                          onClick={() => handleAdvanceWorkflow(req)}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10.5px] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 animate-pulse"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Start In Progress</span>
                        </button>
                      )}

                      {req.status === "In Progress" && (
                        <button
                          onClick={() => handleAdvanceWorkflow(req)}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Resolved</span>
                        </button>
                      )}

                      {req.status === "Completed" && (
                        <div className="w-full py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900 font-bold text-[10px] rounded-xl text-center flex items-center justify-center gap-1 font-mono">
                          ✓ Service Complete
                        </div>
                      )}

                      {/* Manual drop-down to toggle any status */}
                      <select
                        value={req.status}
                        onChange={async (e) => {
                          const nextStatus = e.target.value;
                          const payload: any = { status: nextStatus };
                          payload.operatorName = "Operations Desk";
                          await onUpdateServiceRequest(req.id, payload);
                        }}
                        className="p-1.5 text-[10px] border border-slate-250 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-mono font-bold"
                        title="Force Set Status"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    {/* Progress visual bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden flex">
                      <div className={`h-full ${req.status === "Pending" ? "w-1/5 bg-amber-500 animate-pulse" : req.status === "Accepted" ? "w-2/5 bg-blue-500" : req.status === "Assigned" ? "w-3/5 bg-sky-500" : req.status === "In Progress" ? "w-4/5 bg-indigo-500 animate-pulse" : "w-full bg-emerald-500"}`} />
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
