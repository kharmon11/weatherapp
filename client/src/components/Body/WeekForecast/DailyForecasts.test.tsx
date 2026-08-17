import {describe, it, expect} from "vitest"
import {render, screen} from "@testing-library/react"
import DailyForecasts from "./DailyForecasts"
import type {DailyForecast} from "../../../types/openweathermap"

const makeDay = (overrides: Partial<DailyForecast> = {}): DailyForecast => ({
    clouds: 40,
    dew_point: 50.4,
    dt: 1_700_000_000,
    feels_like: {day: 70, eve: 65, morn: 55, night: 60},
    humidity: 55,
    moon_phase: 0.5,
    moon_rise: 1_700_010_000,
    moon_set: 1_700_050_000,
    pop: 0.42,
    pressure: 1012,
    summary: "Partly cloudy",
    sunrise: 1_699_990_000,
    sunset: 1_700_030_000,
    temp: {day: 68, eve: 62, max: 72.6, min: 58.2, morn: 55, night: 60},
    uvi: 5,
    weather: [{description: "scattered clouds", icon: "03d", id: 802, main: "Clouds"}],
    wind_deg: 180,
    wind_speed: 12.4,
    ...overrides
})

describe("DailyForecasts", () => {
    it("renders each day's high/low temp, dewpoint, and precipitation chance", () => {
        render(<DailyForecasts daily={[makeDay()]} timezone="America/New_York"/>)

        expect(screen.getByText("73°F")).toBeInTheDocument()
        expect(screen.getByText("58°F")).toBeInTheDocument()
        expect(screen.getByText("50°F")).toBeInTheDocument()
        expect(screen.getByText("42%")).toBeInTheDocument()
        expect(screen.getByText("12")).toBeInTheDocument()
    })

    it("shows the wind gust when present", () => {
        render(<DailyForecasts daily={[makeDay({wind_gust: 25.9})]} timezone="America/New_York"/>)

        expect(screen.getByText("26")).toBeInTheDocument()
    })

    it("omits the gust display when wind_gust is undefined", () => {
        const {container} = render(<DailyForecasts daily={[makeDay({wind_gust: undefined})]} timezone="America/New_York"/>)

        const windRow = container.querySelector(".day-wind")
        expect(windRow?.textContent).toBe("Wind/Gust: 12mph")
    })

    it("renders one .day-forecast per entry, and none when daily is empty", () => {
        const {container, rerender} = render(
            <DailyForecasts daily={[makeDay({dt: 1}), makeDay({dt: 2}), makeDay({dt: 3})]} timezone="America/New_York"/>
        )
        expect(container.querySelectorAll(".day-forecast")).toHaveLength(3)

        rerender(<DailyForecasts daily={[]} timezone="America/New_York"/>)
        expect(container.querySelectorAll(".day-forecast")).toHaveLength(0)
    })

    it("renders the weather icon with the day's description", () => {
        render(<DailyForecasts daily={[makeDay()]} timezone="America/New_York"/>)

        expect(screen.getByAltText("scattered clouds")).toBeInTheDocument()
    })
})
