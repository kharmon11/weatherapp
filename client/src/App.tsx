import './App.css'
import React from 'react'
import {useState} from "react";
import { MdMyLocation } from 'react-icons/md'
import axios from 'axios'

function Header() {
    return (
        <header className="header">

        </header>
    )
}

function Body() {
    const [location, setLocation] = useState("")
    const [weather, setWeather] = useState(null)
    // const [error, setError] = useState(null)

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)

    const apiCall = async (location: string) => {
        try {
            const res = await axios.get("http://localhost:8000/api/openweathermap", {params: {location}})
            setWeather(res.data)
            console.log(res.data)
            // setError(null)
        } catch (err) {
            console.log(err)
        }
    }

    const handleSubmit = async () => {
        await apiCall(location)
    }

    const handleMyLocation =  () => {
        navigator.geolocation.getCurrentPosition(async position => {
            console.log(position.coords)
            const location = `${position.coords.latitude},${position.coords.longitude}`
            await apiCall(location)
        }, err => {
            console.error("Geolocation Error: ", err)
        })
    }
    return (
        <main className="main">
            <h1>WeatherApp</h1>
            <div className={"location-form panel"}>
                <p>Enter Location</p>
                <input id="location-input" className={"location-input"} type="text" placeholder={"Enter Location"} value={location}
                       onChange={handleInput}/>
                <button id={"location-submit"} onClick={handleSubmit}>Submit</button>
                <button id={"my-location-btn"} onClick={handleMyLocation}><MdMyLocation/>My Location</button>
            </div>
            {weather && (
                <div id={"weather-output"} className={"weather-output panel"}>
                    <div className={"current-conditions"}>
                        <div className={"location"}>
                            <div className={"coordinates"}>
                                lat: {weather.lat_string}, lon: {weather.lon_string}
                            </div>
                            <div className={"location-name"}>{weather.location_text}</div>
                        </div>
                        <div className={"current-time"}>{weather.data.current.dt}</div>
                    </div>

                    <h4>Temp: {weather.data.current.temp}&deg;</h4>
                    <h4>Conditions: {weather.data.current.weather[0].description}</h4>
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
            <Header />
            <Body />
            <Footer />
        </div>
    )
}

export default App
