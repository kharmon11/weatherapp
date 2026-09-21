import {describe, it, expect} from "vitest"
import {render, screen} from "@testing-library/react"
import Footer from "./Footer"

describe("Footer", () => {
    it("renders the copyright notice with the current year", () => {
        render(<Footer/>)

        const year = new Date().getFullYear()
        expect(screen.getByText(`© ${year} Ken Harmon. All rights reserved.`)).toBeInTheDocument()
    })
})
