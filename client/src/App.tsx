import './App.sass'
import React from 'react'
import {useState} from "react";
import {MdMyLocation} from 'react-icons/md'
import axios from 'axios'

import Current from './components/Current/Current.tsx';
import GoogleMap from './components/GoogleMap/GoogleMap';

import type {OpenWeatherMapResponse} from "./types/openweathermap.ts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Header() {
    return (
        <header className="header">

        </header>
    )
}

function Body() {
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
            alert("Error occurred while retrieving weather data. Try again later.")
        }
    }

    // Handle when #location-submit button is clicked
    const handleSubmit = async () => {
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
            <div className={"location-form panel"}>
                <div className={"location-form-header"}>Enter Location</div>
                <input id="location-input" className={"location-input"} type="text" placeholder={"Enter Location"}
                       value={location}
                       onChange={handleInput}/>
                <button id={"location-submit"} onClick={handleSubmit}>Submit</button>
                <button id={"my-location-btn"} onClick={handleMyLocation}><MdMyLocation/>My Location</button>
            </div>
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

function Footer() {
    return (
        <footer className="footer">

        </footer>
    )
}

function App() {

    return (
        <div className="App">
            <Header/>
            <Body/>
            <Footer/>
        </div>
    )
}

export default App
