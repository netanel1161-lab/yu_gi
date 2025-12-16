import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Load Firebase config at runtime from Netlify Function to avoid embedding keys in the bundle
const loadConfig = async () => {
  try {
    const res = await fetch('/.netlify/functions/firebase-config');
    if (!res.ok) throw new Error(`Config fetch failed: ${res.status}`);
    const cfg = await res.json();

    window.__firebase_config = {
      apiKey: cfg.apiKey,
      authDomain: cfg.authDomain,
      projectId: cfg.projectId,
      storageBucket: cfg.storageBucket,
      messagingSenderId: cfg.messagingSenderId,
      appId: cfg.appId,
      measurementId: cfg.measurementId,
    };
    window.__app_id = cfg.appIdOverride || 'yu1gi';
    window.__admin_uid = cfg.adminUid || '';

    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (err) {
    console.error('Failed to load config', err);
    // Render a minimal error message to the user
    const root = document.getElementById('root');
    if (root) root.innerHTML = '<div style="color:white;background:#111;padding:16px;font-family:sans-serif;">Failed to load configuration.</div>';
  }
};

loadConfig();
