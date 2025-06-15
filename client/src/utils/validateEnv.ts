// src/utils/validateEnv.ts
const REQUIRED_ENV_VARS = [
    'VITE_API_BASE_URL',
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