import {describe, it, expect} from "vitest"
import cloudinessText from "./cloudinessText"

describe("cloudinessText", () => {
    it.each([
        [0, "Clear"],
        [11, "Clear"],
        [12, "Mostly Sunny"],
        [24, "Mostly Sunny"],
        [25, "Scattered Clouds"],
        [49, "Scattered Clouds"],
        [50, "Mostly Cloudy"],
        [86, "Mostly Cloudy"],
        [87, "Overcast"],
        [100, "Overcast"]
    ])("maps %i%% clouds to %s", (clouds, expected) => {
        expect(cloudinessText(clouds)).toBe(expected)
    })
})
