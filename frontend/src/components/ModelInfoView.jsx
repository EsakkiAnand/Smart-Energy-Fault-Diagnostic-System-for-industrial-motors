import React from 'react';
import { Cpu, Award, FileCode, CheckCircle, Database, Layers } from 'lucide-react';

export default function ModelInfoView({ metadata }) {
  const modelInfo = metadata?.model_info || {};
  const classMapping = metadata?.class_mapping || {};

  const leaderboard = modelInfo.all_model_results || [
    { Model: "Extra Trees", Accuracy: 0.999744, "F1-Score (Macro)": 0.999744, "Train Time (s)": 1.74 },
    { Model: "LightGBM", Accuracy: 0.999487, "F1-Score (Macro)": 0.999487, "Train Time (s)": 8.24 },
    { Model: "Random Forest", Accuracy: 0.998975, "F1-Score (Macro)": 0.998974, "Train Time (s)": 8.10 },
    { Model: "XGBoost", Accuracy: 0.998291, "F1-Score (Macro)": 0.998291, "Train Time (s)": 13.28 },
    { Model: "Decision Tree", Accuracy: 0.984703, "F1-Score (Macro)": 0.984693, "Train Time (s)": 8.51 },
    { Model: "Logistic Regression", Accuracy: 0.919586, "F1-Score (Macro)": 0.919487, "Train Time (s)": 12.93 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Model Overview Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            <Cpu className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">SELECTED BEST MODEL</span>
            <h2 className="text-2xl font-black text-slate-100 mt-0.5">
              {modelInfo.best_model_name || 'Extra Trees Classifier'}
            </h2>
            <p className="text-xs text-slate-400">
              UCI Sensorless Drive Diagnosis Benchmark (58,509 Samples)
            </p>
          </div>
        </div>

        {/* Core Metrics Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Test Accuracy</span>
            <p className="text-lg font-black text-emerald-400">
              {modelInfo.accuracy ? `${(modelInfo.accuracy * 100).toFixed(2)}%` : '99.97%'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Macro F1-Score</span>
            <p className="text-lg font-black text-cyan-400">
              {modelInfo.macro_f1 ? `${(modelInfo.macro_f1 * 100).toFixed(2)}%` : '99.97%'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Input Features</span>
            <p className="text-lg font-black text-slate-200">48 Channels</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Target Classes</span>
            <p className="text-lg font-black text-slate-200">11 Classes</p>
          </div>
        </div>
      </div>

      {/* Model Technical Specification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
            <Layers className="w-4 h-4 text-cyan-400" /> Preprocessing Pipeline
          </div>
          <p className="text-base font-bold text-slate-100">StandardScaler</p>
          <p className="text-xs text-slate-400">
            Feature normalization fitted strictly on 80% training data; persisted as <code className="text-cyan-300">scaler.joblib</code>.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
            <FileCode className="w-4 h-4 text-emerald-400" /> Model Storage File
          </div>
          <p className="text-base font-bold text-slate-100">best_motor_fault_model.joblib</p>
          <p className="text-xs text-slate-400">
            Serialized tree ensemble artifact loaded directly into memory by FastAPI service for sub-2ms inference.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
            <Database className="w-4 h-4 text-amber-400" /> Dataset Source
          </div>
          <p className="text-base font-bold text-slate-100">UCI Sensorless Drive Dataset</p>
          <p className="text-xs text-slate-400">
            Passau University benchmark containing 58,509 motor drive stator current signal recordings.
          </p>
        </div>
      </div>

      {/* Model Leaderboard & Target Classes Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Leaderboard */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">Evaluated Model Leaderboard</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Model Name</th>
                  <th className="p-2.5 text-right">Accuracy</th>
                  <th className="p-2.5 text-right">Macro F1</th>
                  <th className="p-2.5 text-right">Train Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {leaderboard.map((m, idx) => {
                  const isTop = idx === 0;
                  return (
                    <tr key={idx} className={isTop ? 'bg-cyan-500/10 font-bold text-cyan-200' : 'text-slate-300'}>
                      <td className="p-2.5 font-sans flex items-center gap-1.5">
                        {isTop && <CheckCircle className="w-3.5 h-3.5 text-cyan-400 inline" />}
                        <span>{m.Model}</span>
                      </td>
                      <td className="p-2.5 text-right text-emerald-400">{(m.Accuracy * 100).toFixed(2)}%</td>
                      <td className="p-2.5 text-right text-cyan-400">{(m["F1-Score (Macro)"] * 100).toFixed(2)}%</td>
                      <td className="p-2.5 text-right text-slate-400">{m["Train Time (s)"]}s</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Target Classes Mapping Table */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100">Target Condition Classes Mapping (11 Classes)</h3>
          <div className="overflow-y-auto max-h-72 space-y-2 pr-1">
            {Object.entries(classMapping).map(([id, label]) => {
              const isNormal = id === '1';
              return (
                <div key={id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-lg font-mono font-bold flex items-center justify-center text-xs ${
                      isNormal ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {id}
                    </span>
                    <span className="font-semibold text-slate-200">{label}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isNormal ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isNormal ? 'NORMAL' : 'FAULT'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
