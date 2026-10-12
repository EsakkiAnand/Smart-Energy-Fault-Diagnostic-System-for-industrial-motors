import React from 'react';
import { Activity, ShieldCheck, Cpu, Radio, Clock, AlertTriangle } from 'lucide-react';

export default function Header({ apiHealth, isSimulating, lastTimestamp, isDemoMode }) {
  const isOnline = apiHealth?.status === 'ONLINE';

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Title & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20 text-white">
          <Activity className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Smart Energy Fault Diagnostic System
            </h1>
            {isDemoMode && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> DEMO / TEST DATA
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-medium">
            AI-Powered Industrial Motor Fault Diagnosis Engine
          </p>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex items-center flex-wrap gap-3">
        {/* ML Model Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">ML Model:</span>
          <span className="font-semibold text-slate-200">{apiHealth?.model_name || 'Extra Trees'}</span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> ONLINE
          </span>
        </div>

        {/* API Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">API:</span>
          {isOnline ? (
            <span className="font-semibold text-emerald-400">CONNECTED</span>
          ) : (
            <span className="font-semibold text-rose-400">DISCONNECTED</span>
          )}
        </div>

        {/* Monitoring Mode */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <Radio className={`w-3.5 h-3.5 ${isSimulating ? 'text-cyan-400 animate-spin' : 'text-slate-500'}`} />
          <span className="text-slate-400">Mode:</span>
          {isSimulating ? (
            <span className="font-bold text-cyan-400 flex items-center gap-1">
              LIVE SIMULATION <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            </span>
          ) : (
            <span className="font-medium text-slate-400">IDLE</span>
          )}
        </div>

        {/* Timestamp */}
        {lastTimestamp && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Last: {lastTimestamp}</span>
          </div>
        )}
      </div>
    </header>
  );
}
