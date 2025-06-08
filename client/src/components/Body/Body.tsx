import './Body.sass'
import React, {useState} from "react";
import type {MapMouseEvent} from "@vis.gl/react-google-maps";
import weatherService from "../../services/weatherService.ts";
import type {OpenWeatherMapResponse} from "../../types/openweathermap.ts";
import Spinner from "../common/spinner.tsx"
import LocationForm from "./LocationForm/LocationForm.tsx";
import Current from "./Current/Current.tsx";
import GoogleMap from "./GoogleMap/GoogleMap.tsx";
import WeekForecast from "./WeekForecast/WeekForecast.tsx"



export default function Body() {
    const [location, setLocation] = useState("")
    const [weather, setWeather] = useState<OpenWeatherMapResponse | null>(null)
    const [locationError, setLocationError] = useState("")
    const [googleMapError, setGoogleMapError] = useState(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    // Sets location state whenever user changes value of #location-input field
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)

    // Handle API calls to /api/openweathermap
    const apiCall = async (location: string, updateLocationInput = false) => {
        try {
            setIsLoading(true)
            const weatherData = await weatherService(location)
            resetErrorMessages()
            setWeather(weatherData)
            if (updateLocationInput) {
                setLocation(weatherData.location_text)
            }
        } catch (err) {
            const error = err as { error_type: string, message: string }
            setLocationError(error.message)
        } finally {
            setIsLoading(false)
        }

    }

    // Reset all error messages
    const resetErrorMessages = () => {
        setLocationError("")
        setGoogleMapError(false)
    }

    // Handle when #location-submit button is clicked
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        await apiCall(location)
    }

    // Handle when #my-location-btn is clicked
    const handleMyLocation = () => {
        setIsLoading(true)
        navigator.geolocation.getCurrentPosition(async position => {
            if (import.meta.env.MODE === "development") {
                console.log(position.coords)
            }
            const location = `${position.coords.latitude},${position.coords.longitude}`
            resetErrorMessages()
            await apiCall(location, true)
        }, err => {
            setIsLoading(false)
            console.error("Geolocation Error: ", err)
            switch (err.code) {
                case err.PERMISSION_DENIED:
                    setLocationError("Browser is refusing access to your location. Change your settings")
                    break;
                case err.POSITION_UNAVAILABLE:
                    setLocationError("Location unavailable. Your device could not determine your location.")
                    break;
                case err.TIMEOUT:
                    setLocationError("Location request timed out. Try again in a moment.")
                    break;
                default:
                    setLocationError("An unknown error occurred.")
            }
        })
    }

    const handleMapClick = async (event: MapMouseEvent) => {
        const coords = event.detail.latLng
        if (coords) {
            const location = `${coords.lat},${coords.lng}`
            await apiCall(location)
        } else {
            setGoogleMapError(true)
        }
    }

    const googleMapErrorStyle = {
        display: googleMapError ? "block" : "none",
        color: "#c00",
        fontSize: "0.9rem"

    }

    return (
        <main className="main">
            <h1>Weather</h1>
            <LocationForm location={location} locationError={locationError} handleInput={handleInput}
                          handleSubmit={handleSubmit}
                          handleMyLocation={handleMyLocation}/>
            {isLoading && (
                <div className={"spinner-wrapper"}>
                    <Spinner/>
                    <div className={"loading-text"}>Loading...</div>
                </div>
            )}
            {weather && (
                <div className={"weather-output"}>
                    <div className={"current-wrapper"}>
                        <Current current={weather.data.current} timezone={weather.data.timezone}
                                 location_text={weather.location_text}/>
                        <div className={"google-map panel"}>
                            <div className={"coordinates"}>
                                lat: {weather.lat_string}, lon: {weather.lon_string}
                            </div>
                            <div className={"google-map-error"} style={googleMapErrorStyle}>
                                Unable to retrieve coordinates from map. Please try again later.
                            </div>
                            <GoogleMap lat={weather.data.lat} lon={weather.data.lon} handleMapClick={handleMapClick}/>
                            <div>Click on map to get forecast</div>
                        </div>
                    </div>
                    <WeekForecast daily={weather.data.daily} timezone={weather.data.timezone}/>
                </div>
            )}
        </main>
    )
}