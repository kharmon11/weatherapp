// src/utils/analytics.ts
export const initializeGA = (): void => {
    const measurementId = import.meta.env.VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID;

    if (!measurementId) {
        if (import.meta.env.DEV) {
            console.log('Google Analytics not initialized - no measurement ID provided');
        }
        return;
    }

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];

    // Define gtag function
    window.gtag = function() {
        window.dataLayer.push(arguments);
    };

    // Create and load the gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;

    script.onload = () => {
        window.gtag('js', new Date());
        window.gtag('config', measurementId, {
            send_page_view: true
        });

        // Send initial page view for SPAs
        window.gtag('event', 'page_view', {
            page_title: document.title,
            page_location: window.location.href
        });
    };

    script.onerror = () => {
        console.error('Failed to load Google Analytics script');
    };

    document.head.appendChild(script);
};