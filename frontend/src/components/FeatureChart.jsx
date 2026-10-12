import React, { useState } from 'react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { Activity, Sliders } from 'lucide-react';

export default function FeatureChart({ history, featureIndex, setFeatureIndex }) {
  // Extract chart data points from history log
  const chartData = history.map((item, idx) => ({
    time: item.timestamp || `#${idx + 1}`,
    val: item.features_summary?.raw_features ? item.features_summary.raw_features[featureIndex] : 0,
    fault: item.predicted_class
  })).slice(-30); // keep last 30 readings

  const vals = chartData.map(d => d.val);
  const curVal = vals.length > 0 ? vals[vals.length - 1] : 0;
  const minVal = vals.length > 0 ? Math.min(...vals) : 0;
  const maxVal = vals.length > 0 ? Math.max(...vals) : 0;
  const meanVal = vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length) : 0;

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-slate-100">Real-Time Sensor Signal Feature Visualization</h3>
        </div>

        {/* Feature Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Select Feature:
          </label>
          <select
            value={featureIndex}
            onChange={(e) => setFeatureIndex(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 text-xs font-semibold focus:outline-none focus:border-cyan-500"
          >
            {Array.from({ length: 48 }).map((_, i) => (
              <option key={i} value={i}>
                Feature {i + 1} (Sensor Signal Channel {i + 1})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feature Statistics Summary Bar */}
      <div className="grid grid-cols-4 gap-3 text-center">
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Current</span>
          <p className="text-sm font-mono font-bold text-cyan-300">{curVal.toFixed(4)}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Min</span>
          <p className="text-sm font-mono font-bold text-emerald-400">{minVal.toFixed(4)}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Max</span>
          <p className="text-sm font-mono font-bold text-rose-400">{maxVal.toFixed(4)}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Mean</span>
          <p className="text-sm font-mono font-bold text-amber-300">{meanVal.toFixed(4)}</p>
        </div>
      </div>

      {/* Recharts Line Chart */}
      <div className="h-64 w-full pt-2">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
            Run a prediction or start simulation to visualize live sensor trends.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                itemStyle={{ color: '#38bdf8' }}
              />
              <Line
                type="monotone"
                dataKey="val"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#38bdf8' }}
                activeDot={{ r: 6, fill: '#22d3ee' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
