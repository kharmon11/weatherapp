import {useEffect} from "react";
import {APIProvider, Map, AdvancedMarker, useMap, type MapMouseEvent} from "@vis.gl/react-google-maps";

interface GoogleMapProps {
    lat: number;
    lon: number;
    handleMapClick: (event: MapMouseEvent) => void;
}

// Moves the existing map to a new location instead of recreating it. The Map is
// uncontrolled (defaultCenter only applies at creation), so this is what
// recenters it, while leaving the user's own panning and zoom alone. It must
// render inside <Map> for useMap() to find the instance.
function Recenter({lat, lon}: { lat: number; lon: number }) {
    const map = useMap()

    useEffect(() => {
        map?.panTo({lat, lng: lon})
    }, [map, lat, lon])

    return null
}

export default function GoogleMap({lat, lon, handleMapClick}: GoogleMapProps) {
    const center = {lat: lat, lng: lon};

    return (
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_JAVASCRIPT_KEY}>
            <Map
                defaultZoom={10}
                defaultCenter={center}
                style={{width: "100%", height: "100%"}}
                mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
                zoomControl={true}
                onClick={handleMapClick}
            >
                <Recenter lat={lat} lon={lon}/>
                <AdvancedMarker position={center} title="Center"/>
            </Map>
        </APIProvider>
    )
}
