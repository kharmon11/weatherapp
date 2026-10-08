import {describe, it, expect, vi, beforeEach} from "vitest"
import {render, screen} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import WeekForecast from "./WeekForecast"
import DailyForecasts from "./DailyForecasts"
import type {DailyForecast} from "../../../types/openweathermap"

// DailyForecasts and WeekGraphs are exercised by their own test files; here we
// only care about WeekForecast's own tab logic, which swaps which panel is
// shown via the week-forecast-panel-active/-inactive classes (WeekForecast.sass
// maps those directly to display: block/none), and about WeekGraphs only being
// loaded and mounted on demand.
// The factory runs when the module is first imported, so this counts chunk loads.
// (The test file must not import WeekGraphs itself, or the count starts at 1.)
const graphsModuleLoads = vi.hoisted(() => ({count: 0}))
const mockWeekGraphs = vi.hoisted(() => vi.fn())
vi.mock("./DailyForecasts", () => ({
    default: vi.fn(() => <div data-testid="daily-forecasts-mock"/>)
}))
vi.mock("./WeekGraphs", () => {
    graphsModuleLoads.count++
    return {default: mockWeekGraphs}
})

const mockDailyForecasts = vi.mocked(DailyForecasts)

const daily = [] as DailyForecast[]

describe("WeekForecast", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockWeekGraphs.mockImplementation(() => <div data-testid="week-graphs-mock"/>)
    })

    // These two must run first: once WeekGraphs has been imported it stays
    // loaded for the rest of this file.
    it("does not load or mount WeekGraphs until it is needed", () => {
        const {container} = render(<WeekForecast daily={daily} timezone="America/New_York"/>)

        expect(graphsModuleLoads.count).toBe(0)
        expect(mockWeekGraphs).not.toHaveBeenCalled()
        expect(container.querySelector(".daily-graphs-wrapper")).not.toBeInTheDocument()
    })

    it("starts loading the graphs chunk when the pointer enters the Graphs button, without mounting it", async () => {
        const user = userEvent.setup()
        render(<WeekForecast daily={daily} timezone="America/New_York"/>)

        await user.hover(screen.getByText("Graphs"))

        await vi.waitFor(() => expect(graphsModuleLoads.count).toBe(1))
        expect(mockWeekGraphs).not.toHaveBeenCalled()
    })

    it("shows the Forecast panel active and no Graphs panel initially", () => {
        const {container} = render(<WeekForecast daily={daily} timezone="America/New_York"/>)

        expect(screen.getByText("Forecast").className).toContain("week-forecast-btn-active")
        expect(screen.getByText("Graphs").className).toContain("week-forecast-btn-inactive")
        expect(container.querySelector(".daily-forecasts-wrapper")?.className).toContain("week-forecast-panel-active")
    })

    it("mounts the graphs and swaps the active panel and button when Graphs is clicked", async () => {
        const user = userEvent.setup()
        const {container} = render(<WeekForecast daily={daily} timezone="America/New_York"/>)

        await user.click(screen.getByText("Graphs"))
        await screen.findByTestId("week-graphs-mock")

        expect(screen.getByText("Forecast").className).toContain("week-forecast-btn-inactive")
        expect(screen.getByText("Graphs").className).toContain("week-forecast-btn-active")
        expect(container.querySelector(".daily-forecasts-wrapper")?.className).toContain("week-forecast-panel-inactive")
        expect(container.querySelector(".daily-graphs-wrapper")?.className).toContain("week-forecast-panel-active")
    })

    it("swaps back on Forecast click and keeps the graphs mounted", async () => {
        const user = userEvent.setup()
        const {container} = render(<WeekForecast daily={daily} timezone="America/New_York"/>)

        await user.click(screen.getByText("Graphs"))
        await screen.findByTestId("week-graphs-mock")
        await user.click(screen.getByText("Forecast"))

        expect(screen.getByText("Forecast").className).toContain("week-forecast-btn-active")
        expect(screen.getByText("Graphs").className).toContain("week-forecast-btn-inactive")
        expect(container.querySelector(".daily-forecasts-wrapper")?.className).toContain("week-forecast-panel-active")
        expect(container.querySelector(".daily-graphs-wrapper")?.className).toContain("week-forecast-panel-inactive")
        expect(screen.getByTestId("week-graphs-mock")).toBeInTheDocument()
    })

    it("keeps a tab active when its already-active button is clicked again", async () => {
        const user = userEvent.setup()
        const {container} = render(<WeekForecast daily={daily} timezone="America/New_York"/>)

        await user.click(screen.getByText("Forecast"))
        expect(screen.getByText("Forecast").className).toContain("week-forecast-btn-active")
        expect(container.querySelector(".daily-forecasts-wrapper")?.className).toContain("week-forecast-panel-active")

        await user.click(screen.getByText("Graphs"))
        await screen.findByTestId("week-graphs-mock")
        await user.click(screen.getByText("Graphs"))
        expect(screen.getByText("Graphs").className).toContain("week-forecast-btn-active")
        expect(container.querySelector(".daily-graphs-wrapper")?.className).toContain("week-forecast-panel-active")
    })

    it("passes daily and timezone through to both children", async () => {
        const user = userEvent.setup()
        const sampleDaily = [{dt: 1}] as unknown as DailyForecast[]
        render(<WeekForecast daily={sampleDaily} timezone="America/Chicago"/>)
        await user.click(screen.getByText("Graphs"))
        await screen.findByTestId("week-graphs-mock")

        expect(mockDailyForecasts.mock.calls[0][0]).toEqual({daily: sampleDaily, timezone: "America/Chicago"})
        expect(mockWeekGraphs.mock.calls[0][0]).toEqual({daily: sampleDaily, timezone: "America/Chicago"})
    })
})
