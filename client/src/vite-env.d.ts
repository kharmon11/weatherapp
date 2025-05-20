/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_GOOGLE_MAPS_JAVASCRIPT_KEY: string;
    readonly VITE_GOOGLE_MAPS_MAP_ID: string;
}
interface ImportMeta {
    readonly env: ImportMetaEnv;
}