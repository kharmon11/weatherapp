import './Body.sass'
import {Suspense, lazy} from 'react'

import type {MapMouseEvent} from "@vis.gl/react-google-maps";

import useWeather from "../../hooks/useWeather.tsx"
import Spinner from "../common/Spinner.tsx"
import LocationForm from "./LocationForm.tsx";
const Current = lazy(() => import("./Current"))
const WeekForecast = lazy(() => import("./WeekForecast/WeekForecast.tsx"))

export default function Body() {
  const {
    weather,
    isLoading,
    locationError,
    googleMapError,
    fetchWeather,
    fetchWeatherByGeolocation,
    fetchWeatherByMapClick
  } = useWeather();

  // Fetch weather data when #location-submit button is clicked
  const handleSubmit = async (locationInput: string) => {
    // e.preventDefault()
    await fetchWeather(locationInput)
  }

  // Handle when #my-location-btn is clicked
  const handleMyLocation = () => {
    fetchWeatherByGeolocation()
  }

  // Handle map click - just pass the event to the hook function
  const handleMapClick = async (event: MapMouseEvent) => {
    await fetchWeatherByMapClick(event)
  }

  return (
    <main className="main">
      <div className={"weather-header"}>Weather</div>
      <LocationForm
        locationError={locationError}
        handleSubmit={handleSubmit}
        handleMyLocation={handleMyLocation}
      />
      {isLoading && (<Spinner/>)}
      {weather && (
        <Suspense>
          <div className={"weather-output"}>
            <div className={"current-wrapper"}>
              <Current
                current={weather.data.current}
                minutely={weather.data.minutely ? weather.data.minutely : []}
                timezone={weather.data.timezone}
                location_text={weather.location_text}
                lat={weather.data.lat}
                lon={weather.data.lon}
                lat_string={weather.lat_string}
                lon_string={weather.lon_string}
                handleMapClick={handleMapClick}
                googleMapError={googleMapError}
              />
            </div>
            <WeekForecast daily={weather.data.daily} timezone={weather.data.timezone}/>
          </div>
        </Suspense>
      )}
    </main>
  )
}