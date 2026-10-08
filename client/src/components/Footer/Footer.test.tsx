import {describe, it, expect} from "vitest"
import {render, screen} from "@testing-library/react"
import Footer from "./Footer"

describe("Footer", () => {
    it("renders the copyright notice with the current year", () => {
        render(<Footer/>)

        const year = new Date().getFullYear()
        expect(screen.getByText(`© ${year} Ken Harmon. All rights reserved.`)).toBeInTheDocument()
    })

    it("links to the GitHub repository with an accessible name", () => {
        render(<Footer/>)

        expect(screen.getByRole("link", {name: "WeatherApp on GitHub"}))
            .toHaveAttribute("href", "https://github.com/kharmon11/weatherapp")
    })
})
