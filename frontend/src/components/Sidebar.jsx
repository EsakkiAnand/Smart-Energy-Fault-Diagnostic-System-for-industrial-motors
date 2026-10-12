import React from 'react';
import { 
  LayoutDashboard, Zap, Activity, History, Info, Settings, 
  ChevronRight, Sparkles 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'live-diagnosis', label: 'Live Diagnosis', icon: Zap, badge: '48 Sensors' },
    { id: 'sensor-data', label: 'Sensor Analytics', icon: Activity, badge: 'Realtime' },
    { id: 'history', label: 'Prediction History', icon: History, badge: null },
    { id: 'model-info', label: 'Model Metrics', icon: Info, badge: '99.97%' },
    { id: 'settings', label: 'System Settings', icon: Settings, badge: null }
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
            System Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/10 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-500/5'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-4 h-4 text-cyan-400" />}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Industrial AI Core Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/90 text-xs space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>XGBoost / Extra Trees AI Engine</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Multi-channel stator current feature extraction & continuous health diagnosis.
          </p>
          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>StandardScaler: <strong className="text-slate-300">Active</strong></span>
            <span>Latency: <strong className="text-emerald-400">&lt;2ms</strong></span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-900 text-[11px] text-slate-500 flex items-center justify-between">
        <span>System Version v1.0</span>
        <span className="text-emerald-500 font-medium">● Edge Ready</span>
      </div>
    </aside>
  );
}
