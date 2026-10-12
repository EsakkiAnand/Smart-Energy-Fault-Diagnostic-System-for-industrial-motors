import React from 'react';
import { Play, Sparkles } from 'lucide-react';

export default function DemoBar({ onSelectPreset, isLoading }) {
  const demoButtons = [
    { key: 'normal', label: 'Normal Motor', color: 'hover:bg-emerald-500/20 hover:border-emerald-500/40 text-emerald-300' },
    { key: 'bearing', label: 'Bearing Fault', color: 'hover:bg-rose-500/20 hover:border-rose-500/40 text-rose-300' },
    { key: 'rotor_unbalance', label: 'Rotor Unbalance', color: 'hover:bg-amber-500/20 hover:border-amber-500/40 text-amber-300' },
    { key: 'inverter_a', label: 'Phase A Open', color: 'hover:bg-rose-500/20 hover:border-rose-500/40 text-rose-300' },
    { key: 'inverter_b', label: 'Phase B Open', color: 'hover:bg-rose-500/20 hover:border-rose-500/40 text-rose-300' },
    { key: 'inverter_c', label: 'Phase C Open', color: 'hover:bg-rose-500/20 hover:border-rose-500/40 text-rose-300' },
    { key: 'overload', label: 'Stator Overload', color: 'hover:bg-orange-500/20 hover:border-orange-500/40 text-orange-300' },
    { key: 'voltage_sag', label: 'Voltage Sag', color: 'hover:bg-yellow-500/20 hover:border-yellow-500/40 text-yellow-300' },
    { key: 'harmonics', label: 'Harmonics', color: 'hover:bg-blue-500/20 hover:border-blue-500/40 text-blue-300' },
    { key: 'dc_overvoltage', label: 'DC Overvoltage', color: 'hover:bg-rose-500/20 hover:border-rose-500/40 text-rose-300' },
    { key: 'overheating', label: 'Overheating', color: 'hover:bg-orange-500/20 hover:border-orange-500/40 text-orange-300' }
  ];

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Presentation Demo Mode (Loads Actual Test Dataset Samples & Runs Real ML Model)</span>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          Click any preset to diagnose immediately
        </span>
      </div>

      <div className="flex items-center flex-wrap gap-2">
        {demoButtons.map((btn) => (
          <button
            key={btn.key}
            disabled={isLoading}
            onClick={() => onSelectPreset(btn.key)}
            className={`px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950/80 text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50 ${btn.color}`}
          >
            <Play className="w-3 h-3 fill-current opacity-70" />
            <span>{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
