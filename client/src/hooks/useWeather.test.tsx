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
    lat_string: "42.35 °N",
    lon_string: "71.06 °W",
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

            expect(mockWeatherService).toHaveBeenCalledWith("Boston", expect.any(AbortSignal))
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
            expect(mockWeatherService).toHaveBeenCalledWith("42.35,-71.06", expect.any(AbortSignal))
        })

        it("asks the browser for a coarse, cached, time-limited position", () => {
            const {result} = renderHook(() => useWeather())

            act(() => {
                result.current.fetchWeatherByGeolocation()
            })

            expect(mockGetCurrentPosition).toHaveBeenCalledWith(
                expect.any(Function),
                expect.any(Function),
                {enableHighAccuracy: false, timeout: 20000, maximumAge: 300000}
            )
        })

        it("ignores a geolocation result that arrives after a newer search", async () => {
            let deliverPosition: PositionCallback = () => {}
            mockGetCurrentPosition.mockImplementation((success) => {
                deliverPosition = success
            })
            mockWeatherService.mockResolvedValue(fakeWeather)
            const {result} = renderHook(() => useWeather())

            act(() => {
                result.current.fetchWeatherByGeolocation()
            })
            await act(async () => {
                await result.current.fetchWeather("Boston")
            })
            await act(async () => {
                deliverPosition({coords: {latitude: 1, longitude: 2}} as GeolocationPosition)
            })

            expect(mockWeatherService).toHaveBeenCalledTimes(1)
            expect(mockWeatherService).toHaveBeenCalledWith("Boston", expect.any(AbortSignal))
            expect(result.current.isLoading).toBe(false)
        })

        it("ignores a geolocation error that arrives after a newer search", async () => {
            let deliverError: PositionErrorCallback = () => {}
            mockGetCurrentPosition.mockImplementation((_success, error) => {
                deliverError = error
            })
            mockWeatherService.mockResolvedValue(fakeWeather)
            const {result} = renderHook(() => useWeather())

            act(() => {
                result.current.fetchWeatherByGeolocation()
            })
            await act(async () => {
                await result.current.fetchWeather("Boston")
            })
            act(() => {
                deliverError({code: 1, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3} as GeolocationPositionError)
            })

            expect(result.current.locationError).toBe("")
            expect(result.current.weather).toEqual(fakeWeather)
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

            expect(mockWeatherService).toHaveBeenCalledWith("10,20", expect.any(AbortSignal))
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

    describe("overlapping requests", () => {
        const deferred = () => {
            let resolve!: (value: OpenWeatherMapResponse) => void
            let reject!: (reason: unknown) => void
            const promise = new Promise<OpenWeatherMapResponse>((res, rej) => {
                resolve = res
                reject = rej
            })
            return {promise, resolve, reject}
        }
        const otherWeather = {...fakeWeather, location_text: "Denver, CO"} as OpenWeatherMapResponse

        it("keeps the newest result and the spinner until the newest request finishes", async () => {
            const first = deferred()
            const second = deferred()
            mockWeatherService.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
            const {result} = renderHook(() => useWeather())

            act(() => {
                void result.current.fetchWeather("Boston")
            })
            act(() => {
                void result.current.fetchWeather("Denver")
            })
            const firstSignal = mockWeatherService.mock.calls[0][1] as AbortSignal
            expect(firstSignal.aborted).toBe(true)

            await act(async () => {
                first.resolve(fakeWeather) // the older request finishes first
            })
            expect(result.current.weather).toBeNull()
            expect(result.current.isLoading).toBe(true)

            await act(async () => {
                second.resolve(otherWeather)
            })
            expect(result.current.weather).toEqual(otherWeather)
            expect(result.current.isLoading).toBe(false)
        })

        it("does not show an error from a request that was superseded", async () => {
            const first = deferred()
            mockWeatherService
                .mockReturnValueOnce(first.promise)
                .mockResolvedValueOnce(otherWeather)
            const {result} = renderHook(() => useWeather())

            act(() => {
                void result.current.fetchWeather("Boston")
            })
            await act(async () => {
                await result.current.fetchWeather("Denver")
            })
            await act(async () => {
                first.reject({error_type: "canceled", message: "Request canceled"})
            })

            expect(result.current.locationError).toBe("")
            expect(result.current.weather).toEqual(otherWeather)
        })

        it("aborts the in-flight request when unmounted", () => {
            mockWeatherService.mockReturnValue(deferred().promise)
            const {result, unmount} = renderHook(() => useWeather())

            act(() => {
                void result.current.fetchWeather("Boston")
            })
            const signal = mockWeatherService.mock.calls[0][1] as AbortSignal
            expect(signal.aborted).toBe(false)

            unmount()

            expect(signal.aborted).toBe(true)
        })
    })
})
