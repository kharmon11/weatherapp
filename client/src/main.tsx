import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.sass'
import App from './App.tsx'

// Get Google Analytics Measurement ID from environment variable
const measurementId = import.meta.env.VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID;

if (measurementId) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: any[]) {
        window.dataLayer.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', measurementId);
}

const requiredEnvVars = [
    'VITE_API_BASE_URL',
    'VITE_GOOGLE_MAPS_JAVASCRIPT_KEY',
    'VITE_GOOGLE_MAPS_MAP_ID',
];
for (const envVar of requiredEnvVars) {
    if (!import.meta.env[envVar]) {
        console.error(`Missing environment variable: ${envVar}`);
        throw new Error(`Missing environment variable: ${envVar}`);
    }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
