import {describe, it, expect} from "vitest"
import rainOrSnow from "./rainOrSnow"

describe("rainOrSnow", () => {
    it("detects rain in the description", () => {
        expect(rainOrSnow("light rain")).toBe("rain")
    })

    it("detects snow in the description", () => {
        expect(rainOrSnow("light snow")).toBe("snow")
    })

    it("returns none for descriptions with neither", () => {
        expect(rainOrSnow("clear sky")).toBe("none")
    })
})
