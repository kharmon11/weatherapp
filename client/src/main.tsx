import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.sass'
import App from './App.tsx'

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
