import React, { useState } from 'react';
import { 
  Sliders, RefreshCw, Trash2, Send, CheckCircle, AlertCircle, 
  Upload, Sparkles, ChevronDown, ChevronUp 
} from 'lucide-react';
import CSVUploader from './CSVUploader';

export default function DiagnosisPanel({ 
  features, setFeatures, onRunDiagnosis, isLoading, onCSVBatchComplete, onRandomize 
}) {
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'csv'
  const [activeGroup, setActiveGroup] = useState(0); // 0, 1, 2, 3
  const [errorMsg, setErrorMsg] = useState(null);

  const groups = [
    { name: "Phase A Current Signal", range: [0, 12], desc: "Stator Phase A EMD Intrinsic Mode Features (Features 1-12)" },
    { name: "Phase B Current Signal", range: [12, 24], desc: "Stator Phase B EMD Intrinsic Mode Features (Features 13-24)" },
    { name: "Phase C Current Signal", range: [24, 36], desc: "Stator Phase C EMD Intrinsic Mode Features (Features 25-36)" },
    { name: "Global Drive Moments", range: [36, 48], desc: "Cross-phase Spectral Power & Statistical Kurtosis (Features 37-48)" }
  ];

  const handleInputChange = (index, value) => {
    const num = parseFloat(value);
    const newFeats = [...features];
    newFeats[index] = isNaN(num) ? 0 : num;
    setFeatures(newFeats);
    if (errorMsg) setErrorMsg(null);
  };

  const handleClear = () => {
    setFeatures(new Array(48).fill(0));
    setErrorMsg(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (features.length !== 48 || features.some(v => typeof v !== 'number' || isNaN(v))) {
      setErrorMsg("Validation Error: Exactly 48 numerical feature values are required.");
      return;
    }
    setErrorMsg(null);
    onRunDiagnosis(features);
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-slate-100">Live Motor Fault Diagnostic Panel</h2>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'manual' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Manual 48-Sensor Input
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'csv' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> CSV Batch Upload
          </button>
        </div>
      </div>

      {activeTab === 'csv' ? (
        <CSVUploader onBatchComplete={onCSVBatchComplete} />
      ) : (
        <form onSubmit={handleFormSubmit} className="space-y-5">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {groups.map((grp, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setActiveGroup(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeGroup === idx
                      ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  Group {idx + 1} ({grp.range[0] + 1}-{grp.range[1]})
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onRandomize}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Randomize
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Clear
              </button>
            </div>
          </div>

          {/* Group Header Description */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span><strong>{groups[activeGroup].name}:</strong> {groups[activeGroup].desc}</span>
            <span className="text-[11px] text-cyan-400 font-medium">12 Sensor Channels</span>
          </div>

          {/* 12 Features Grid for Selected Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {features.slice(groups[activeGroup].range[0], groups[activeGroup].range[1]).map((val, relIdx) => {
              const absIdx = groups[activeGroup].range[0] + relIdx;
              const isValid = typeof val === 'number' && !isNaN(val);
              return (
                <div key={absIdx} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 transition-all space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Feature {absIdx + 1}</span>
                    {isValid ? (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-0.5"><CheckCircle className="w-3 h-3" /> Valid</span>
                    ) : (
                      <span className="text-[10px] text-rose-400 flex items-center gap-0.5"><AlertCircle className="w-3 h-3" /> Invalid</span>
                    )}
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={val}
                    onChange={(e) => handleInputChange(absIdx, e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-sm focus:outline-none focus:border-cyan-500 transition-all"
                  />
                </div>
              );
            })}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Running ML StandardScaler & Extra Trees Model...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Run Machine Learning Fault Diagnosis</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
