import {APIProvider, Map, AdvancedMarker} from "@vis.gl/react-google-maps";

interface GoogleMapProps {
    lat: number;
    lon: number;
}

export default function GoogleMap({lat, lon}: GoogleMapProps) {
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
            >
                <AdvancedMarker position={center} title="Center"/>
            </Map>
        </APIProvider>
    )
}

