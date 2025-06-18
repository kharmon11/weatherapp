import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.sass'
import App from './App.tsx'
import { initializeGA } from './utils/analytics'
import { validateRequiredEnvVars } from './utils/validateEnv'

// Initialize services
initializeGA();
validateRequiredEnvVars();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)