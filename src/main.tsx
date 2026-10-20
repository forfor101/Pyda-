import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initGlobalWhatsAppTracker } from './utils/leadTracking';

// Initialize event tracking for WhatsApp Business clicks across all pages
initGlobalWhatsAppTracker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
