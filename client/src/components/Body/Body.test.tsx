import {describe, it, expect, vi, beforeEach} from "vitest"
import {render, screen, waitFor} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Body from "./Body"
import useWeather from "../../hooks/useWeather.tsx"
import type {OpenWeatherMapResponse} from "../../types/openweathermap.ts"

vi.mock("../../hooks/useWeather.tsx")
// Factories run when a module is first imported, so these count chunk loads.
const chunkLoads = vi.hoisted(() => ({current: 0, weekForecast: 0}))
vi.mock("./Current", () => {
    chunkLoads.current++
    return {default: () => <div data-testid="current-mock"/>}
})
vi.mock("./WeekForecast/WeekForecast.tsx", () => {
    chunkLoads.weekForecast++
    return {default: () => <div data-testid="week-forecast-mock"/>}
})

const mockUseWeather = vi.mocked(useWeather)

const fakeWeather = {
    location_text: "Boston, MA",
    lat_string: "42.35 °N",
    lon_string: "71.06 °W",
    data: {lat: 42.35, lon: -71.06, timezone: "America/New_York", timezone_offset: -14400, current: {}, daily: []}
} as unknown as OpenWeatherMapResponse

const baseHookReturn = {
    weather: null,
    isLoading: false,
    locationError: "",
    googleMapError: false,
    fetchWeather: vi.fn(),
    fetchWeatherByGeolocation: vi.fn(),
    fetchWeatherByMapClick: vi.fn()
}

describe("Body", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders nothing extra before any fetch has happened", () => {
        mockUseWeather.mockReturnValue(baseHookReturn)
        render(<Body/>)

        expect(document.querySelector(".spinner-wrapper")).not.toBeInTheDocument()
        expect(screen.queryByTestId("current-mock")).not.toBeInTheDocument()
        expect(chunkLoads).toEqual({current: 0, weekForecast: 0}) // nothing is fetched before a search
    })

    it("starts loading the result components as soon as a request begins", async () => {
        // Must run before any test that renders weather: once imported, a
        // module stays loaded for the rest of this file.
        mockUseWeather.mockReturnValue({...baseHookReturn, isLoading: true})
        render(<Body/>)

        await waitFor(() => expect(chunkLoads).toEqual({current: 1, weekForecast: 1}))
        expect(screen.queryByTestId("current-mock")).not.toBeInTheDocument() // still no weather to show
    })

    it("shows the spinner while loading and hides weather output", () => {
        mockUseWeather.mockReturnValue({...baseHookReturn, isLoading: true})
        render(<Body/>)

        expect(document.querySelector(".spinner-wrapper")).toBeInTheDocument()
        expect(screen.queryByTestId("current-mock")).not.toBeInTheDocument()
    })

    it("renders weather output once weather data is available", async () => {
        mockUseWeather.mockReturnValue({...baseHookReturn, weather: fakeWeather})
        render(<Body/>)

        expect(await screen.findByTestId("current-mock")).toBeInTheDocument()
        expect(screen.getByTestId("week-forecast-mock")).toBeInTheDocument()
    })

    it("wires the location form submit through to fetchWeather", async () => {
        const user = userEvent.setup()
        const fetchWeather = vi.fn()
        mockUseWeather.mockReturnValue({...baseHookReturn, fetchWeather})
        render(<Body/>)

        await user.type(screen.getByPlaceholderText(/city, state, zipcode/i), "Chicago")
        await user.click(screen.getByRole("button", {name: /submit/i}))

        expect(fetchWeather).toHaveBeenCalledExactlyOnceWith("Chicago")
    })

    it("wires the my-location button through to fetchWeatherByGeolocation", async () => {
        const user = userEvent.setup()
        const fetchWeatherByGeolocation = vi.fn()
        mockUseWeather.mockReturnValue({...baseHookReturn, fetchWeatherByGeolocation})
        render(<Body/>)

        await user.click(screen.getByRole("button", {name: /my location/i}))

        expect(fetchWeatherByGeolocation).toHaveBeenCalledOnce()
    })

    it("surfaces locationError from the hook in the LocationForm", () => {
        mockUseWeather.mockReturnValue({...baseHookReturn, locationError: "Location not found"})
        render(<Body/>)

        expect(screen.getByText("Location not found")).toBeInTheDocument()
    })
})
