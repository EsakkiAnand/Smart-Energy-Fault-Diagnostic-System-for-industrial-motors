import React from 'react';
import { 
  CheckCircle2, AlertOctagon, Gauge, Clock, ShieldAlert, HeartPulse 
} from 'lucide-react';

export default function MetricCards({ currentPrediction, isSimulating }) {
  const isFault = currentPrediction?.status === 'FAULT DETECTED';
  const statusColor = isFault
    ? 'border-rose-500/40 bg-rose-950/20 text-rose-400 glow-rose'
    : 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400 glow-emerald';

  const healthScore = currentPrediction?.motor_health_score ?? 100;
  const healthColor = healthScore > 80 ? 'text-emerald-400' : healthScore > 50 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
      {/* 1. Current Status */}
      <div className={`p-4 rounded-2xl border transition-all duration-300 ${statusColor}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Status</span>
          {isFault ? <AlertOctagon className="w-5 h-5 text-rose-400 animate-bounce" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
        </div>
        <div className="mt-3">
          <p className="text-lg font-black tracking-tight">{currentPrediction?.status || 'NORMAL'}</p>
          <span className="text-[11px] opacity-80">
            {isFault ? 'Attention Required' : 'Optimal Operation'}
          </span>
        </div>
      </div>

      {/* 2. Detected Fault */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Detected Condition</span>
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="mt-3">
          <p className="text-base font-bold truncate text-slate-100" title={currentPrediction?.predicted_class || 'Normal Operation'}>
            {currentPrediction?.predicted_class || 'Normal Operation'}
          </p>
          <span className="text-[11px] text-slate-400">
            Class ID: {currentPrediction?.class_id || 1}
          </span>
        </div>
      </div>

      {/* 3. Prediction Confidence */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Confidence</span>
          <Gauge className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="mt-3 flex items-baseline gap-1">
          <p className="text-2xl font-black text-cyan-300">
            {currentPrediction?.confidence !== undefined ? `${currentPrediction.confidence.toFixed(2)}%` : '99.97%'}
          </p>
        </div>
      </div>

      {/* 4. Inference Time */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Inference Time</span>
          <Clock className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="mt-3 flex items-baseline gap-1">
          <p className="text-2xl font-black text-emerald-400">
            {currentPrediction?.inference_time_ms ? `${currentPrediction.inference_time_ms} ms` : '1.74 ms'}
          </p>
        </div>
      </div>

      {/* 5. Motor Health Score */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">AI Health Score</span>
          <HeartPulse className="w-4 h-4 text-rose-400" />
        </div>
        <div className="mt-3 flex items-baseline gap-1">
          <p className={`text-2xl font-black ${healthColor}`}>
            {healthScore}%
          </p>
          <span className="text-[10px] text-slate-400">AI Diagnostic</span>
        </div>
      </div>

      {/* 6. Monitoring Status */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">Monitoring</span>
          <span className={`w-2.5 h-2.5 rounded-full ${isSimulating ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'}`}></span>
        </div>
        <div className="mt-3">
          <p className="text-base font-bold text-slate-200">
            {isSimulating ? 'STREAMING' : 'READY / IDLE'}
          </p>
          <span className="text-[11px] text-slate-400">48 Signal Channels</span>
        </div>
      </div>
    </div>
  );
}
