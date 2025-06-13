import {useState} from "react";
import type {OpenWeatherMapResponse} from "../types/openweathermap.ts";
import weatherService from "../services/weatherService.ts";
import type {MapMouseEvent} from "@vis.gl/react-google-maps";

export default function useWeather() {
    const [weather, setWeather] = useState<OpenWeatherMapResponse | null>(null) // OpenWeatherMap data
    const [locationError, setLocationError] = useState("") // Whether the user location caused an error
    const [googleMapError, setGoogleMapError] = useState(false) // If the GoogleMap component caused an error
    const [isLoading, setIsLoading] = useState<boolean>(false) // Whether the loading spinner is active

    // Reset all error messages
    const resetErrorMessages = () => {
        setLocationError("")
        setGoogleMapError(false)
    }

    // Handle API calls to /api/openweathermap
    const fetchWeather = async (location: string) => {
        try {
            setIsLoading(true)
            const weatherData = await weatherService(location)
            resetErrorMessages()
            setWeather(weatherData)
        } catch (err) {
            const error = err as { error_type: string, message: string }
            setLocationError(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    // Handle when #my-location-btn is clicked
    const fetchWeatherByGeolocation = () => {
        setIsLoading(true)
        navigator.geolocation.getCurrentPosition(async position => {
            if (import.meta.env.MODE === "development") {
                console.log(position.coords)
            }
            const location = `${position.coords.latitude},${position.coords.longitude}`
            resetErrorMessages()
            await fetchWeather(location)
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

    // Fetch weather data from location info derived from map click
    const fetchWeatherByMapClick = async (event: MapMouseEvent) => {
        const coords = event.detail.latLng
        if (coords) {
            const location = `${coords.lat},${coords.lng}`
            await fetchWeather(location)
        } else {
            setGoogleMapError(true)
        }
    }

    return {
        weather,
        isLoading,
        locationError,
        googleMapError,
        fetchWeather,
        fetchWeatherByGeolocation,
        fetchWeatherByMapClick
    }
}