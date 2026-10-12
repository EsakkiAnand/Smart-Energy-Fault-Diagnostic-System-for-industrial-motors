const API_BASE = '/api';

export async function fetchHealthStatus() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Health API error:', err);
    return { status: 'OFFLINE', model_loaded: false, model_name: 'Unavailable' };
  }
}

export async function fetchMetadata() {
  try {
    const res = await fetch(`${API_BASE}/metadata`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Metadata API error:', err);
    return null;
  }
}

export async function fetchDemoPresets() {
  try {
    const res = await fetch(`${API_BASE}/demo-presets`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Demo Presets error:', err);
    return { presets: {} };
  }
}

export async function fetchRandomSample(targetClass = null) {
  try {
    const url = targetClass ? `${API_BASE}/random-sample?target_class=${targetClass}` : `${API_BASE}/random-sample`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Random sample error:', err);
    return null;
  }
}

export async function predictMotorFault(features) {
  try {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features })
    });
    
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || `Server error: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error('Prediction API error:', err);
    throw err;
  }
}

export async function uploadCSVFile(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${API_BASE}/upload-csv`, {
      method: 'POST',
      body: formData
    });
    
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || `Upload error: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error('CSV upload error:', err);
    throw err;
  }
}
