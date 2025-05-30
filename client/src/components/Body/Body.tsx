import './Body.sass'
import React, {useState} from "react";
import type {OpenWeatherMapResponse} from "../../types/openweathermap.ts";
import axios from "axios";
import LocationForm from "./LocationForm/LocationForm.tsx";
import Current from "./Current/Current.tsx";
import GoogleMap from "./GoogleMap/GoogleMap.tsx";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Body() {
    const [location, setLocation] = useState("")
    const [weather, setWeather] = useState<OpenWeatherMapResponse | null>(null)
    // const [error, setError] = useState(null)

    // Sets location state whenever user changes value of #location-input field
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)

    // Handle API calls to /api/openweathermap
    const apiCall = async (location: string, updateLocationInput = false) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/openweathermap`, {params: {location}})
            // const currentTime = currentDatetimeString(res.data.current.dt, res.data.timezone)
            setWeather(res.data)
            if (import.meta.env.MODE === "development") {
                console.log(res.data)
            }
            if (updateLocationInput) {
                setLocation(res.data.location_text)
            }
            // setError(null)
        } catch (err) {
            console.log(err)
            if (axios.isAxiosError(err)) {
                console.error(err.response)
                if (err.response) {
                    if (err.response.status === 404)
                        alert("Geocoding error. Try a different location name.")
                } else {
                    alert("Server error. Try again later.")
                }
            } else {
                alert("Error occurred while retrieving weather data. Try again later.")
            }
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
                            <GoogleMap lat={weather.data.lat} lon={weather.data.lon}/>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}