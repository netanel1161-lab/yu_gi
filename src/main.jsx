import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Inject Firebase config and admin UID before rendering
window.__firebase_config = {
  apiKey: "AIzaSyBp-6sQpXEwdHL2Z2VZkJAyxuLmJnk73HI",
  authDomain: "yu1gi-c2f95.firebaseapp.com",
  projectId: "yu1gi-c2f95",
  storageBucket: "yu1gi-c2f95.firebasestorage.app",
  messagingSenderId: "295551778748",
  appId: "1:295551778748:web:06f9c762aa1563c6c3b5b9",
  measurementId: "G-SEG4BHM57Q",
};
window.__app_id = "yu1gi";
window.__admin_uid = "EsOtACggw9cNeTFZm0Tf0WWNcRP2";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
