/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { KeyRound, ShieldAlert, ArrowLeft, Lock } from "lucide-react";
import { AUTH_CONFIG, type AuthRole } from "../config/authConfig";

interface AdminLoginProps {
  onLoginSuccess: (payload: { username: string; role: AuthRole }) => void;
  onClose: () => void;
}

export default function AdminLogin({ onLoginSuccess, onClose }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    setTimeout(() => {
      const found = (Object.keys(AUTH_CONFIG) as (keyof typeof AUTH_CONFIG)[]).find((k) => {
        return (
          AUTH_CONFIG[k].username === username.trim() &&
          AUTH_CONFIG[k].password === password
        );
      });

      if (!found) {
        setErrorMsg("Invalid username or password.");
        setIsLoading(false);
        return;
      }

      const role = AUTH_CONFIG[found].role;
      onLoginSuccess({ username: username.trim(), role });
      setIsLoading(false);
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
              <h2 className="font-bold text-base text-slate-100">Staff Sign In</h2>
              <p className="font-mono text-[9px] text-slate-400 tracking-wider font-semibold">Authorized Hotel Staff Only</p>
            </div>

          </div>
          <button
            onClick={onClose}
            aria-label="Return to site"
            className="group inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-600/10 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:text-indigo-200 transition-colors" />
          </button>
        </div>

        {/* Portal Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="bg-indigo-600/5 rounded-xl border border-indigo-600/15 p-3 text-xs text-indigo-200/90 leading-relaxed">
            Authorized admin or front desk receptionist. Log in to manage 30-room room assignment logs, audit payments, and process checkins.
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" /> Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Sanghars"
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


      </div>
    </div>
  );
}
