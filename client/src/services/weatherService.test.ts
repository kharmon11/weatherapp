import {describe, it, expect, vi, beforeEach} from "vitest"
import axios from "axios"
import weatherService from "./weatherService"

vi.mock("axios")

describe("weatherService", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(console, "log").mockImplementation(() => {})
        vi.spyOn(console, "error").mockImplementation(() => {})
    })

    it("returns response data on success", async () => {
        const data = {location_text: "Boston"}
        vi.mocked(axios.get).mockResolvedValue({data})

        const result = await weatherService("Boston")

        expect(result).toEqual(data)
        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining("/api/openweathermap"),
            {params: {location: "Boston"}}
        )
    })

    it("throws a not-found error for a 404 response", async () => {
        vi.mocked(axios.get).mockRejectedValue({
            response: {status: 404, data: {detail: {error_type: "not found", message: "Location not found"}}}
        })
        vi.mocked(axios.isAxiosError).mockReturnValue(true)

        await expect(weatherService("Nowhere")).rejects.toEqual({
            error_type: "not found",
            message: "Location not found"
        })
    })

    it("falls back to default 404 message/type when detail is missing", async () => {
        vi.mocked(axios.get).mockRejectedValue({response: {status: 404, data: {}}})
        vi.mocked(axios.isAxiosError).mockReturnValue(true)

        await expect(weatherService("Nowhere")).rejects.toEqual({
            error_type: "not found",
            message: "Location not found"
        })
    })

    it("throws a generic server error for non-404 HTTP statuses", async () => {
        vi.mocked(axios.get).mockRejectedValue({response: {status: 500}})
        vi.mocked(axios.isAxiosError).mockReturnValue(true)

        await expect(weatherService("Boston")).rejects.toEqual({
            error_type: "server error",
            message: "Server Error: 500"
        })
    })

    it("throws a timeout error on ECONNABORTED", async () => {
        vi.mocked(axios.get).mockRejectedValue({code: "ECONNABORTED"})
        vi.mocked(axios.isAxiosError).mockReturnValue(true)

        await expect(weatherService("Boston")).rejects.toEqual({
            error_type: "timeout",
            message: "Weather service timed out. Please try again later."
        })
    })

    it("throws a network error when there is no response and no timeout code", async () => {
        vi.mocked(axios.get).mockRejectedValue({code: "ERR_NETWORK"})
        vi.mocked(axios.isAxiosError).mockReturnValue(true)

        await expect(weatherService("Boston")).rejects.toEqual({
            error_type: "network error",
            message: "Could not connect to weather service. Check your connection or try again later."
        })
    })

    it("throws an unexpected error for non-Axios errors", async () => {
        vi.mocked(axios.get).mockRejectedValue(new Error("boom"))
        vi.mocked(axios.isAxiosError).mockReturnValue(false)

        await expect(weatherService("Boston")).rejects.toEqual({
            error_type: "unexpected error",
            message: "An unexpected error occurred."
        })
    })
})
