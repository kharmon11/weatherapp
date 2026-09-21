// src/utils/validateEnv.ts
// VITE_API_BASE_URL is intentionally NOT in this list: an empty string is its
// correct, intentional value for deployed builds (same-origin API calls,
// since FastAPI always serves the frontend and API from the same origin in
// every deployed environment), not a misconfiguration. Only local dev sets it
// to an absolute URL, since Vite and FastAPI run as separate servers there.
const REQUIRED_ENV_VARS = [
    'VITE_GOOGLE_MAPS_JAVASCRIPT_KEY',
    'VITE_GOOGLE_MAPS_MAP_ID',
] as const;

export const validateRequiredEnvVars = (): void => {
    for (const envVar of REQUIRED_ENV_VARS) {
        if (!import.meta.env[envVar]) {
            console.error(`Missing environment variable: ${envVar}`);
            throw new Error(`Missing environment variable: ${envVar}`);
        }
    }
};