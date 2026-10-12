import React from 'react';
import { Play, Pause, Square, Radio, FastForward } from 'lucide-react';

export default function RealtimeSimulation({ 
  isSimulating, setIsSimulating, speedInterval, setSpeedInterval, sampleCount 
}) {
  return (
    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
      {/* Controls & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {!isSimulating ? (
            <button
              onClick={() => setIsSimulating(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs tracking-wide flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Play className="w-4 h-4 fill-current" /> Start Streaming Simulation
            </button>
          ) : (
            <button
              onClick={() => setIsSimulating(false)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs tracking-wide flex items-center gap-2 transition-all"
            >
              <Pause className="w-4 h-4 fill-current" /> Pause Simulation
            </button>
          )}

          {isSimulating && (
            <button
              onClick={() => setIsSimulating(false)}
              className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-rose-400 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Square className="w-3.5 h-3.5 fill-current" /> Stop
            </button>
          )}
        </div>

        {/* Live Indicator Badge */}
        {isSimulating ? (
          <span className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 animate-pulse">
            <Radio className="w-3.5 h-3.5" /> Simulation Running ●
          </span>
        ) : (
          <span className="px-3 py-1.5 rounded-xl bg-slate-950 text-slate-400 border border-slate-800 text-xs font-semibold">
            Simulation Stopped
          </span>
        )}
      </div>

      {/* Speed & Counter Controls */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <FastForward className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 font-medium">Interval:</span>
          <select
            value={speedInterval}
            onChange={(e) => setSpeedInterval(Number(e.target.value))}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 font-bold focus:outline-none"
          >
            <option value={500}>500 ms (Fast)</option>
            <option value={1000}>1.0 sec (Standard)</option>
            <option value={2000}>2.0 sec</option>
            <option value={5000}>5.0 sec</option>
          </select>
        </div>

        <div className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono font-bold">
          Samples Streamed: <span className="text-cyan-400">{sampleCount}</span>
        </div>
      </div>
    </div>
  );
}
