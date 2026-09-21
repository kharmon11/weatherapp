import {describe, it, expect, vi, beforeEach} from "vitest"
import {render, screen} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import WeekForecast from "./WeekForecast"
import DailyForecasts from "./DailyForecasts"
import WeekGraphs from "./WeekGraphs"
import type {DailyForecast} from "../../../types/openweathermap"

// DailyForecasts and WeekGraphs are exercised by their own test files; here we
// only care about WeekForecast's own toggle logic, which swaps which panel is
// shown via the week-forecast-panel-active/-inactive classes (WeekForecast.sass
// maps those directly to display: block/none).
vi.mock("./DailyForecasts", () => ({
    default: vi.fn(() => <div data-testid="daily-forecasts-mock"/>)
}))
vi.mock("./WeekGraphs", () => ({
    default: vi.fn(() => <div data-testid="week-graphs-mock"/>)
}))

const mockDailyForecasts = vi.mocked(DailyForecasts)
const mockWeekGraphs = vi.mocked(WeekGraphs)

const daily = [] as DailyForecast[]

describe("WeekForecast", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("shows the Forecast panel active and Graphs panel inactive initially", async () => {
        const {container} = render(<WeekForecast daily={daily} timezone="America/New_York"/>)
        await screen.findByTestId("week-graphs-mock")

        expect(screen.getByText("Forecast").className).toContain("week-forecast-btn-active")
        expect(screen.getByText("Graphs").className).toContain("week-forecast-btn-inactive")
        expect(container.querySelector(".daily-forecasts-wrapper")?.className).toContain("week-forecast-panel-active")
        expect(container.querySelector(".daily-graphs-wrapper")?.className).toContain("week-forecast-panel-inactive")
    })

    it("swaps the active panel and button when the Graphs button is clicked", async () => {
        const user = userEvent.setup()
        const {container} = render(<WeekForecast daily={daily} timezone="America/New_York"/>)
        await screen.findByTestId("week-graphs-mock")

        await user.click(screen.getByText("Graphs"))

        expect(screen.getByText("Forecast").className).toContain("week-forecast-btn-inactive")
        expect(screen.getByText("Graphs").className).toContain("week-forecast-btn-active")
        expect(container.querySelector(".daily-forecasts-wrapper")?.className).toContain("week-forecast-panel-inactive")
        expect(container.querySelector(".daily-graphs-wrapper")?.className).toContain("week-forecast-panel-active")
    })

    it("swaps back to the original state on a second click", async () => {
        const user = userEvent.setup()
        const {container} = render(<WeekForecast daily={daily} timezone="America/New_York"/>)
        await screen.findByTestId("week-graphs-mock")

        await user.click(screen.getByText("Graphs"))
        await user.click(screen.getByText("Forecast"))

        expect(screen.getByText("Forecast").className).toContain("week-forecast-btn-active")
        expect(screen.getByText("Graphs").className).toContain("week-forecast-btn-inactive")
        expect(container.querySelector(".daily-forecasts-wrapper")?.className).toContain("week-forecast-panel-active")
        expect(container.querySelector(".daily-graphs-wrapper")?.className).toContain("week-forecast-panel-inactive")
    })

    it("passes daily and timezone through to both children", async () => {
        const sampleDaily = [{dt: 1}] as unknown as DailyForecast[]
        render(<WeekForecast daily={sampleDaily} timezone="America/Chicago"/>)
        await screen.findByTestId("week-graphs-mock")

        expect(mockDailyForecasts.mock.calls[0][0]).toEqual({daily: sampleDaily, timezone: "America/Chicago"})
        expect(mockWeekGraphs.mock.calls[0][0]).toEqual({daily: sampleDaily, timezone: "America/Chicago"})
    })
})
