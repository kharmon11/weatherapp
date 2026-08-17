import {describe, it, expect, vi, beforeEach} from "vitest"
import {renderHook, act, waitFor} from "@testing-library/react"
import type {MapMouseEvent} from "@vis.gl/react-google-maps"
import useWeather from "./useWeather"
import weatherService from "../services/weatherService.ts"
import type {OpenWeatherMapResponse} from "../types/openweathermap.ts"

vi.mock("../services/weatherService.ts")

const mockWeatherService = vi.mocked(weatherService)

const fakeWeather = {
    location_text: "Boston, MA",
    lat_string: "42.35",
    lon_string: "-71.06",
    data: {lat: 42.35, lon: -71.06, timezone: "America/New_York", timezone_offset: -14400}
} as unknown as OpenWeatherMapResponse

const mockGetCurrentPosition = vi.fn()

describe("useWeather", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        Object.defineProperty(navigator, "geolocation", {
            value: {getCurrentPosition: mockGetCurrentPosition},
            configurable: true
        })
    })

    describe("fetchWeather", () => {
        it("sets weather and clears errors on success", async () => {
            mockWeatherService.mockResolvedValue(fakeWeather)
            const {result} = renderHook(() => useWeather())

            await act(async () => {
                await result.current.fetchWeather("Boston")
            })

            expect(mockWeatherService).toHaveBeenCalledWith("Boston")
            expect(result.current.weather).toEqual(fakeWeather)
            expect(result.current.locationError).toBe("")
            expect(result.current.isLoading).toBe(false)
        })

        it("sets locationError and leaves weather unset on failure", async () => {
            mockWeatherService.mockRejectedValue({error_type: "not found", message: "Location not found"})
            const {result} = renderHook(() => useWeather())

            await act(async () => {
                await result.current.fetchWeather("Nowhere")
            })

            expect(result.current.weather).toBeNull()
            expect(result.current.locationError).toBe("Location not found")
            expect(result.current.isLoading).toBe(false)
        })
    })

    describe("fetchWeatherByGeolocation", () => {
        it("derives a lat,lon location string and fetches weather on success", async () => {
            mockGetCurrentPosition.mockImplementation((success) => {
                success({coords: {latitude: 42.35, longitude: -71.06}})
            })
            mockWeatherService.mockResolvedValue(fakeWeather)
            const {result} = renderHook(() => useWeather())

            act(() => {
                result.current.fetchWeatherByGeolocation()
            })

            await waitFor(() => expect(result.current.weather).toEqual(fakeWeather))
            expect(mockWeatherService).toHaveBeenCalledWith("42.35,-71.06")
        })

        it.each([
            [1, "PERMISSION_DENIED", "Browser is refusing access to your location. Change your settings"],
            [2, "POSITION_UNAVAILABLE", "Location unavailable. Your device could not determine your location."],
            [3, "TIMEOUT", "Location request timed out. Try again in a moment."]
        ])("sets a specific message for error code %i (%s)", async (code, _name, expectedMessage) => {
            mockGetCurrentPosition.mockImplementation((_success, error) => {
                error({code, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3})
            })
            const {result} = renderHook(() => useWeather())

            act(() => {
                result.current.fetchWeatherByGeolocation()
            })

            expect(result.current.locationError).toBe(expectedMessage)
            expect(result.current.isLoading).toBe(false)
            expect(mockWeatherService).not.toHaveBeenCalled()
        })

        it("sets a generic message for an unknown error code", async () => {
            mockGetCurrentPosition.mockImplementation((_success, error) => {
                error({code: 99, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3})
            })
            const {result} = renderHook(() => useWeather())

            act(() => {
                result.current.fetchWeatherByGeolocation()
            })

            expect(result.current.locationError).toBe("An unknown error occurred.")
        })
    })

    describe("fetchWeatherByMapClick", () => {
        it("fetches weather using the clicked lat/lng when coords are present", async () => {
            mockWeatherService.mockResolvedValue(fakeWeather)
            const {result} = renderHook(() => useWeather())
            const event = {detail: {latLng: {lat: 10, lng: 20}}} as unknown as MapMouseEvent

            await act(async () => {
                await result.current.fetchWeatherByMapClick(event)
            })

            expect(mockWeatherService).toHaveBeenCalledWith("10,20")
            expect(result.current.weather).toEqual(fakeWeather)
        })

        it("sets googleMapError and does not fetch when coords are missing", async () => {
            const {result} = renderHook(() => useWeather())
            const event = {detail: {latLng: null}} as unknown as MapMouseEvent

            await act(async () => {
                await result.current.fetchWeatherByMapClick(event)
            })

            expect(result.current.googleMapError).toBe(true)
            expect(mockWeatherService).not.toHaveBeenCalled()
        })
    })

    it("clears a prior googleMapError once a subsequent fetch succeeds", async () => {
        const {result} = renderHook(() => useWeather())
        const badEvent = {detail: {latLng: null}} as unknown as MapMouseEvent

        await act(async () => {
            await result.current.fetchWeatherByMapClick(badEvent)
        })
        expect(result.current.googleMapError).toBe(true)

        mockWeatherService.mockResolvedValue(fakeWeather)
        await act(async () => {
            await result.current.fetchWeather("Boston")
        })

        expect(result.current.googleMapError).toBe(false)
    })
})
