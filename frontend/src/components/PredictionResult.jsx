import React from 'react';
import { 
  AlertTriangle, CheckCircle2, ShieldAlert, Cpu, 
  Wrench, Activity, BarChart2, HeartPulse, Clock 
} from 'lucide-react';

export default function PredictionResult({ result }) {
  if (!result) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center text-slate-400 space-y-3">
        <Cpu className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
        <p className="text-sm font-semibold">No Diagnosis Triggered Yet</p>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Submit 48 sensor feature values above or select a preset demo button to run instant ML inference.
        </p>
      </div>
    );
  }

  const isFault = result.status === 'FAULT DETECTED';
  const severityColors = {
    NORMAL: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    LOW: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    MEDIUM: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    HIGH: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    CRITICAL: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
  };

  const severityBadgeClass = severityColors[result.severity] || severityColors.HIGH;

  return (
    <div className="space-y-5">
      {/* 1. Main Visual Condition Banner */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isFault ? 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-950 border-rose-500/50 glow-rose' : 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/50 glow-emerald'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-2xl ${isFault ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {isFault ? <AlertTriangle className="w-8 h-8 animate-bounce" /> : <CheckCircle2 className="w-8 h-8" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">MOTOR CONDITION DIAGNOSIS</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${severityBadgeClass}`}>
                  SEVERITY: {result.severity}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-100 mt-1">
                {result.predicted_class}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-6 bg-slate-950/80 px-5 py-3 rounded-2xl border border-slate-800">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Confidence</span>
              <p className="text-xl font-black text-cyan-300">{result.confidence.toFixed(2)}%</p>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Latency</span>
              <p className="text-xl font-black text-emerald-400">{result.inference_time_ms} ms</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 2. Top Predictions Probability Breakdown */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100">Top Class Probabilities Breakdown</h3>
            </div>
            <span className="text-xs text-slate-400">Extra Trees / XGBoost Probability</span>
          </div>

          <div className="space-y-3">
            {result.top_predictions?.map((item, idx) => {
              const isTop = idx === 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className={isTop ? 'text-cyan-300 font-bold' : 'text-slate-400'}>
                      {item.condition} {isTop && '(Predicted Target)'}
                    </span>
                    <span className={isTop ? 'text-cyan-300 font-bold' : 'text-slate-400'}>
                      {item.probability.toFixed(2)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isTop ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-slate-700'
                      }`}
                      style={{ width: `${Math.max(item.probability, 2)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. AI Health Gauge & Recommended Action */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-slate-100">AI Motor Health Gauge</h3>
              </div>
              <span className="text-xs font-bold text-slate-400">{result.motor_health_score}% Health</span>
            </div>

            {/* Health Meter Progress Bar */}
            <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-700 rounded-full ${
                  result.motor_health_score > 80
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : result.motor_health_score > 50
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    : 'bg-gradient-to-r from-rose-600 to-red-400'
                }`}
                style={{ width: `${result.motor_health_score}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              *Application-level diagnostic score derived from ML model confidence.
            </p>
          </div>

          {/* Recommended Action Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400">
              <div className="flex items-center gap-1.5">
                <Wrench className="w-4 h-4" /> Recommended Action
              </div>
              <span>{result.recommendation?.priority}</span>
            </div>

            <p className="text-xs font-semibold text-slate-200">
              {result.recommendation?.action}
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {result.recommendation?.inspection}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
