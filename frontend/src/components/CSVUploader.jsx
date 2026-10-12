import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { uploadCSVFile } from '../services/api';

export default function CSVUploader({ onBatchComplete }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.name.endsWith('.csv')) {
      setFile(selected);
      setErrorMsg(null);
    } else {
      setErrorMsg('Please select a valid .csv file containing 48 numerical sensor columns.');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setErrorMsg(null);

    try {
      const result = await uploadCSVFile(file);
      setIsUploading(false);
      if (onBatchComplete) onBatchComplete(result);
    } catch (err) {
      setIsUploading(false);
      setErrorMsg(err.message || 'CSV processing failed.');
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
      <div className="p-4 rounded-full bg-cyan-500/10 text-cyan-400 w-16 h-16 mx-auto flex items-center justify-center">
        <UploadCloud className="w-8 h-8" />
      </div>

      <div>
        <h3 className="text-base font-bold text-slate-100">Batch CSV Motor Sensor Dataset Upload</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Upload a CSV file containing 48 numerical sensor features per row to run automated batch ML diagnosis.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3">
        <label className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-xs font-semibold text-slate-200 cursor-pointer transition-all flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>{file ? file.name : 'Choose CSV File'}</span>
          <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
        </label>

        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isUploading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Batch Processing...
            </>
          ) : (
            'Run Batch Diagnosis'
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
