import React, { useState } from 'react';
import { History, Search, Download, Trash2, Filter } from 'lucide-react';

export default function HistoryTable({ history, onClearHistory }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('timestamp'); // 'timestamp' | 'confidence' | 'inference_time_ms'

  // Filter & Sort Logic
  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.predicted_class?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.status?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'confidence') return b.confidence - a.confidence;
    if (sortBy === 'inference_time_ms') return a.inference_time_ms - b.inference_time_ms;
    return 0; // default chronological order
  });

  const exportCSV = () => {
    if (history.length === 0) return;
    const headers = ['Timestamp', 'Status', 'Predicted Fault', 'Severity', 'Confidence (%)', 'Inference Time (ms)', 'Health Score'];
    const rows = history.map(h => [
      h.timestamp,
      h.status,
      `"${h.predicted_class}"`,
      h.severity,
      h.confidence,
      h.inference_time_ms,
      h.motor_health_score
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `motor_fault_prediction_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-slate-100">Prediction History Log</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-bold">
            {filteredHistory.length} Entries
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search fault condition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-44"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-semibold focus:outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="NORMAL">Normal Only</option>
            <option value="FAULT DETECTED">Faults Only</option>
          </select>

          {/* Export & Clear */}
          <button
            onClick={exportCSV}
            disabled={history.length === 0}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={onClearHistory}
            disabled={history.length === 0}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Status</th>
              <th className="p-3">Predicted Condition</th>
              <th className="p-3">Severity</th>
              <th className="p-3 text-right">Confidence</th>
              <th className="p-3 text-right">Inference Latency</th>
              <th className="p-3 text-right">Health Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500 font-sans">
                  No prediction log entries found matching criteria.
                </td>
              </tr>
            ) : (
              filteredHistory.map((item, idx) => {
                const isFault = item.status === 'FAULT DETECTED';
                return (
                  <tr key={idx} className="hover:bg-slate-950/60 transition-colors">
                    <td className="p-3 text-slate-400 font-sans">{item.timestamp}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isFault ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-200 font-sans">{item.predicted_class}</td>
                    <td className="p-3 font-sans">
                      <span className="text-[10px] font-bold text-slate-400">
                        {item.severity}
                      </span>
                    </td>
                    <td className="p-3 text-right text-cyan-300 font-bold">{item.confidence.toFixed(2)}%</td>
                    <td className="p-3 text-right text-emerald-400">{item.inference_time_ms} ms</td>
                    <td className="p-3 text-right font-bold text-slate-300">{item.motor_health_score}%</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
