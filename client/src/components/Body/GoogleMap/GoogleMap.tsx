import {APIProvider, Map, AdvancedMarker, type MapMouseEvent} from "@vis.gl/react-google-maps";

interface GoogleMapProps {
    lat: number;
    lon: number;
    handleMapClick: (event: MapMouseEvent) => void;
}

export default function GoogleMap({lat, lon, handleMapClick}: GoogleMapProps) {
    const center = {lat: lat, lng: lon}
    return (
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_JAVASCRIPT_KEY}
                     onLoad={() => console.log("Maps API has loaded")}>
            <Map
                defaultZoom={10}
                defaultCenter={{lat: lat, lng: lon}}
                style={{width: "300px", height: "300px"}}
                mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
                zoomControl={true}
                onClick={handleMapClick}
            >
                <AdvancedMarker position={center} title="Center"/>
            </Map>
        </APIProvider>
    )
}

