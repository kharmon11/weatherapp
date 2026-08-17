import {describe, it, expect, vi} from "vitest"
import {render, screen} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import LocationForm from "./LocationForm"

describe("LocationForm", () => {
    it("submits the current input value and prevents default form navigation", async () => {
        const user = userEvent.setup()
        const handleSubmit = vi.fn()
        render(<LocationForm locationError="" handleSubmit={handleSubmit} handleMyLocation={vi.fn()}/>)

        await user.type(screen.getByPlaceholderText(/city, state, zipcode/i), "Boston, MA")
        await user.click(screen.getByRole("button", {name: /submit/i}))

        expect(handleSubmit).toHaveBeenCalledExactlyOnceWith("Boston, MA")
    })

    it("calls handleMyLocation when the my-location button is clicked", async () => {
        const user = userEvent.setup()
        const handleMyLocation = vi.fn()
        render(<LocationForm locationError="" handleSubmit={vi.fn()} handleMyLocation={handleMyLocation}/>)

        await user.click(screen.getByRole("button", {name: /my location/i}))

        expect(handleMyLocation).toHaveBeenCalledOnce()
    })

    it("does not render an error message when locationError is empty", () => {
        render(<LocationForm locationError="" handleSubmit={vi.fn()} handleMyLocation={vi.fn()}/>)

        expect(screen.queryByText(/location not found/i)).not.toBeInTheDocument()
    })

    it("renders the error message when locationError is set", () => {
        render(<LocationForm locationError="Location not found" handleSubmit={vi.fn()} handleMyLocation={vi.fn()}/>)

        expect(screen.getByText("Location not found")).toBeInTheDocument()
    })
})
