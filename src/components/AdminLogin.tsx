/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { KeyRound, ShieldAlert, ArrowLeft, Mail, Lock } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: (user: any) => void;
  onClose: () => void;
}

export default function AdminLogin({ onLoginSuccess, onClose }: AdminLoginProps) {
  const [email, setEmail] = useState("admin@grandcrest.com");
  const [password, setPassword] = useState("pms2026");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    // Simulate login verification
    setTimeout(() => {
      if (email.trim() === "admin@grandcrest.com" && password === "pms2026") {
        onLoginSuccess({
          id: "USR-001",
          email: "admin@grandcrest.com",
          name: "Saurav Sen",
          role: "admin"
        });
      } else {
        setErrorMsg("Incorrect staff login credentials. Please use the instant bypass preset below.");
        setIsLoading(false);
      }
    }, 700);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header decoration */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-600/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-100">Staff Control Panel</h2>
              <p className="font-mono text-[9px] text-slate-400 tracking-wider font-semibold">SECURE SINGLE SIGN-ON</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 py-1 px-2.5 border border-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Site
          </button>
        </div>

        {/* Portal Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="bg-indigo-600/5 rounded-xl border border-indigo-600/15 p-3 text-xs text-indigo-200/90 leading-relaxed">
            Authorized admin or front desk receptionist. Log in to manage 30-room room assignment logs, audit payments, and process checkins.
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Staff Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. reception@grandcrest.com"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" /> Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono"
            />
          </div>

          {errorMsg && (
            <div className="bg-red-950/20 text-red-400 border border-red-950/40 p-3 rounded-lg text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm transition-all shadow-md shadow-indigo-600/15 flex items-center justify-center gap-1 cursor-pointer mt-2"
          >
            {isLoading ? "Validating Staff Authority..." : "Secure SSO Login"}
          </button>
        </form>

        {/* Preset credentials click bypass */}
        <div className="p-6 bg-slate-950 border-t border-slate-800 flex flex-col gap-3">
          <span className="text-[10px] text-slate-400 font-mono block tracking-wide uppercase mb-1">QUICK DEMONSTRATION BYPASS PRES-AUTH</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                onLoginSuccess({
                  id: "USR-001",
                  email: "owner@grandcrest.com",
                  name: "Saurav Sen (Owner)",
                  role: "admin"
                });
              }}
              className="py-2.5 px-3 bg-[#1e293b] hover:bg-[#334155] text-amber-400 font-bold text-xs rounded-xl border border-amber-500/20 flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              👑 Login as Owner (All KPIs)
            </button>
            <button
              type="button"
              onClick={() => {
                onLoginSuccess({
                  id: "USR-002",
                  email: "reception@grandcrest.com",
                  name: "Rajesh Kumar (Front Desk)",
                  role: "receptionist"
                });
              }}
              className="py-2.5 px-3 bg-[#1e293b] hover:bg-[#334155] text-indigo-400 font-bold text-xs rounded-xl border border-indigo-500/20 flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              🛎️ Login as Receptionist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
