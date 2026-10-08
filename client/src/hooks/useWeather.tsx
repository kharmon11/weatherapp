import {useEffect, useRef, useState} from "react";
import type {OpenWeatherMapResponse} from "../types/openweathermap.ts";
import weatherService from "../services/weatherService.ts";
import type {MapMouseEvent} from "@vis.gl/react-google-maps";

// Weather only needs a rough position, so skip high accuracy; accept a fix up
// to 5 minutes old, and stop waiting after 20s (slow first fixes on phones).
const GEOLOCATION_OPTIONS: PositionOptions = {
    enableHighAccuracy: false,
    timeout: 20000,
    maximumAge: 5 * 60 * 1000
}

export default function useWeather() {
    const [weather, setWeather] = useState<OpenWeatherMapResponse | null>(null) // OpenWeatherMap data
    const [locationError, setLocationError] = useState("") // Whether the user location caused an error
    const [googleMapError, setGoogleMapError] = useState(false) // If the GoogleMap component caused an error
    const [isLoading, setIsLoading] = useState<boolean>(false) // Whether the loading spinner is active

    // Only the most recent request (search, geolocation or map click) may
    // update state. Each one takes a new id from latestRequest; older ones
    // see a mismatch and bail out. Aborting cancels the in-flight HTTP call,
    // but a pending geolocation lookup can't be cancelled, so it relies on the id.
    const latestRequest = useRef(0)
    const controllerRef = useRef<AbortController | null>(null)

    const beginRequest = () => {
        controllerRef.current?.abort()
        controllerRef.current = null
        return ++latestRequest.current
    }

    // Invalidate and abort anything in flight on unmount
    useEffect(() => () => {
        latestRequest.current++
        controllerRef.current?.abort()
    }, [])

    // Reset all error messages
    const resetErrorMessages = () => {
        setLocationError("")
        setGoogleMapError(false)
    }

    // Handle API calls to /api/openweathermap
    const fetchWeather = async (location: string) => {
        const requestId = beginRequest()
        const controller = new AbortController()
        controllerRef.current = controller
        try {
            setIsLoading(true)
            const weatherData = await weatherService(location, controller.signal)
            if (requestId !== latestRequest.current) return
            resetErrorMessages()
            setWeather(weatherData)
        } catch (err) {
            if (requestId !== latestRequest.current) return
            const error = err as { error_type: string, message: string }
            setLocationError(error.message)
        } finally {
            if (requestId === latestRequest.current) {
                setIsLoading(false)
            }
        }
    }

    // Handle when #my-location-btn is clicked
    const fetchWeatherByGeolocation = () => {
        const requestId = beginRequest()
        setIsLoading(true)
        navigator.geolocation.getCurrentPosition(async position => {
            if (requestId !== latestRequest.current) return
            if (import.meta.env.MODE === "development") {
                console.log(position.coords)
            }
            const location = `${position.coords.latitude},${position.coords.longitude}`
            resetErrorMessages()
            await fetchWeather(location)
        }, err => {
            if (requestId !== latestRequest.current) return
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
        }, GEOLOCATION_OPTIONS)
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