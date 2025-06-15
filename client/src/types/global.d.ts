interface ImportMetaEnv {
    readonly VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID?: string;
    readonly VITE_API_BASE_URL: string;
    readonly VITE_GOOGLE_MAPS_JAVASCRIPT_KEY: string;
    readonly VITE_GOOGLE_MAPS_MAP_ID: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
}