import './Body.sass'
import React, {useState} from "react";
import type {MapMouseEvent} from "@vis.gl/react-google-maps";
import weatherService from "../../services/weatherService.ts";
import type {OpenWeatherMapResponse} from "../../types/openweathermap.ts";
import LocationForm from "./LocationForm/LocationForm.tsx";
import Current from "./Current/Current.tsx";
import GoogleMap from "./GoogleMap/GoogleMap.tsx";

export default function Body() {
    const [location, setLocation] = useState("")
    // const [coords, setCoords] = useState({}) // { lat: number, lon: number }
    const [weather, setWeather] = useState<OpenWeatherMapResponse | null>(null)
    // const [error, setError] = useState(null)

    // Sets location state whenever user changes value of #location-input field
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)

    // Handle API calls to /api/openweathermap
    const apiCall = async (location: string, updateLocationInput = false) => {
        const weatherData = await weatherService(location)
        setWeather(weatherData)
        if (updateLocationInput) {
            setLocation(weatherData.location_text)
        }
    }

    // Handle when #location-submit button is clicked
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        await apiCall(location)
    }

    // Handle when #my-location-btn is clicked
    const handleMyLocation = () => {
        navigator.geolocation.getCurrentPosition(async position => {
            if (import.meta.env.MODE === "development") {
                console.log(position.coords)
            }
            const location = `${position.coords.latitude},${position.coords.longitude}`
            await apiCall(location, true)
        }, err => {
            console.error("Geolocation Error: ", err)
            alert("Geolocation Error: Geolocation services are not working right now. Try again later.")
        })
    }

    const handleMapClick = async (event: MapMouseEvent) => {
        const coords= event.detail.latLng
        if (coords) {
            const location = `${coords.lat},${coords.lng}`
            await apiCall(location)
        } else {
            alert("Google Map error: Try again later")
        }

    }

    return (
        <main className="main">
            <h1>Weather</h1>
            <LocationForm location={location} handleInput={handleInput} handleSubmit={handleSubmit}
                          handleMyLocation={handleMyLocation}/>
            {weather && (
                <div className={"weather-output"}>
                    <div className={"current-wrapper"}>
                        <Current current={weather.data.current} timezone={weather.data.timezone}
                                 location_text={weather.location_text}/>
                        <div className={"google-map panel"}>
                            <div className={"coordinates"}>
                                lat: {weather.lat_string}, lon: {weather.lon_string}
                            </div>
                            <GoogleMap lat={weather.data.lat} lon={weather.data.lon} handleMapClick={handleMapClick}/>
                            <div>Click on map to get forecast</div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}