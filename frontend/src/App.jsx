import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MetricCards from './components/MetricCards';
import DemoBar from './components/DemoBar';
import DiagnosisPanel from './components/DiagnosisPanel';
import PredictionResult from './components/PredictionResult';
import RealtimeSimulation from './components/RealtimeSimulation';
import FeatureChart from './components/FeatureChart';
import HistoryTable from './components/HistoryTable';
import ModelInfoView from './components/ModelInfoView';

import { 
  fetchHealthStatus, fetchMetadata, fetchDemoPresets, 
  fetchRandomSample, predictMotorFault 
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apiHealth, setApiHealth] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [demoPresets, setDemoPresets] = useState({});

  // Feature Input State (48 values)
  const [features, setFeatures] = useState(new Array(48).fill(0.0));
  const [currentPrediction, setCurrentPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [speedInterval, setSpeedInterval] = useState(1000);
  const [sampleCount, setSampleCount] = useState(0);
  const [featureIndex, setFeatureIndex] = useState(0);

  // Load initial health, metadata, and default preset
  useEffect(() => {
    async function init() {
      const h = await fetchHealthStatus();
      setApiHealth(h);

      const m = await fetchMetadata();
      setMetadata(m);

      const dp = await fetchDemoPresets();
      if (dp?.presets) {
        setDemoPresets(dp.presets);
        // Pre-fill features with Normal preset sample if available
        if (dp.presets.normal?.features) {
          setFeatures(dp.presets.normal.features);
          // Run initial prediction on load
          handleRunDiagnosis(dp.presets.normal.features, false);
        }
      }
    }
    init();
  }, []);

  // Handle Diagnosis Execution
  const handleRunDiagnosis = async (inputFeatures, triggerDemoMode = false) => {
    setIsLoading(true);
    try {
      const res = await predictMotorFault(inputFeatures);
      setCurrentPrediction(res);
      setHistory(prev => [res, ...prev.slice(0, 99)]); // Keep last 100 history items
      setIsDemoMode(triggerDemoMode);
      setIsLoading(false);
      return res;
    } catch (err) {
      console.error('Diagnosis failed:', err);
      setIsLoading(false);
      alert(`Prediction Failed: ${err.message}`);
    }
  };

  // Demo Button Preset Click
  const handleSelectPreset = (presetKey) => {
    const preset = demoPresets[presetKey];
    if (preset?.features) {
      setFeatures(preset.features);
      handleRunDiagnosis(preset.features, true);
    }
  };

  // Randomize Features
  const handleRandomize = async () => {
    const sample = await fetchRandomSample();
    if (sample?.features) {
      setFeatures(sample.features);
      handleRunDiagnosis(sample.features, false);
    }
  };

  // CSV Batch Complete
  const handleCSVBatchComplete = (batchSummary) => {
    alert(`CSV Batch Completed! Total Rows: ${batchSummary.total_rows}, Faults Detected: ${batchSummary.fault_count}`);
  };

  // Real-Time Simulation Interval Loop
  useEffect(() => {
    let timer = null;
    if (isSimulating) {
      timer = setInterval(async () => {
        const sample = await fetchRandomSample();
        if (sample?.features) {
          setFeatures(sample.features);
          try {
            const res = await predictMotorFault(sample.features);
            setCurrentPrediction(res);
            setHistory(prev => [res, ...prev.slice(0, 99)]);
            setSampleCount(prev => prev + 1);
          } catch (e) {
            console.error('Simulation stream error:', e);
          }
        }
      }, speedInterval);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSimulating, speedInterval]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header 
        apiHealth={apiHealth} 
        isSimulating={isSimulating} 
        lastTimestamp={currentPrediction?.timestamp} 
        isDemoMode={isDemoMode}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Dashboard Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {/* Presentation Demo Quick Bar */}
          <DemoBar onSelectPreset={handleSelectPreset} isLoading={isLoading} />

          {/* Metric Summary Cards */}
          <MetricCards currentPrediction={currentPrediction} isSimulating={isSimulating} />

          {/* Tab Views */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <PredictionResult result={currentPrediction} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DiagnosisPanel 
                  features={features} 
                  setFeatures={setFeatures} 
                  onRunDiagnosis={(f) => handleRunDiagnosis(f, false)} 
                  isLoading={isLoading}
                  onCSVBatchComplete={handleCSVBatchComplete}
                  onRandomize={handleRandomize}
                />
                <FeatureChart 
                  history={history} 
                  featureIndex={featureIndex} 
                  setFeatureIndex={setFeatureIndex} 
                />
              </div>
            </div>
          )}

          {activeTab === 'live-diagnosis' && (
            <div className="space-y-6">
              <DiagnosisPanel 
                features={features} 
                setFeatures={setFeatures} 
                onRunDiagnosis={(f) => handleRunDiagnosis(f, false)} 
                isLoading={isLoading}
                onCSVBatchComplete={handleCSVBatchComplete}
                onRandomize={handleRandomize}
              />
              <PredictionResult result={currentPrediction} />
            </div>
          )}

          {activeTab === 'sensor-data' && (
            <div className="space-y-6">
              <RealtimeSimulation 
                isSimulating={isSimulating} 
                setIsSimulating={setIsSimulating} 
                speedInterval={speedInterval} 
                setSpeedInterval={setSpeedInterval} 
                sampleCount={sampleCount} 
              />
              <FeatureChart 
                history={history} 
                featureIndex={featureIndex} 
                setFeatureIndex={setFeatureIndex} 
              />
            </div>
          )}

          {activeTab === 'history' && (
            <HistoryTable 
              history={history} 
              onClearHistory={() => setHistory([])} 
            />
          )}

          {activeTab === 'model-info' && (
            <ModelInfoView metadata={metadata} />
          )}

          {activeTab === 'settings' && (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 max-w-xl">
              <h3 className="text-base font-bold text-slate-100">System Preferences & Settings</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-semibold text-slate-300">FastAPI Backend API Endpoint</span>
                  <span className="text-cyan-400 font-mono">http://127.0.0.1:8000</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-semibold text-slate-300">Default Model Artifact</span>
                  <span className="text-emerald-400 font-mono">best_motor_fault_model.joblib</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-semibold text-slate-300">Default Scaler Artifact</span>
                  <span className="text-emerald-400 font-mono">scaler.joblib</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
