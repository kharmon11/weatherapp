import { chromium } from "playwright";

const url = process.argv[2];
if (!url) {
    console.error("Usage: node smoke-test.mjs <url>");
    process.exit(1);
}

// A fixed, unambiguous location so geocoding results are consistent between runs.
const SEARCH_LOCATION = "Boston, MA";
const EXPECTED_LOCATION_TEXT = /boston/i;

const errors = [];

const browser = await chromium.launch();
try {
    const page = await browser.newPage();

    // KNOWN GAP: this smoke test does not verify the Google Map renders.
    // The real Maps JS script can't reliably load in any headless CI browser -
    // its HTTP-referrer restriction can't cover the ephemeral per-deploy
    // hostname (Google doesn't support wildcarding mid-label), and separately,
    // headless Chromium has no GPU on GitHub's runners, so WebGL-dependent
    // vector-tile rendering fails too. Both are real, unrelated dead ends we
    // hit and confirmed, not assumptions. Rather than chase Google's script
    // for whatever error it produces next (a moving target we don't control),
    // this intercepts the request and returns an empty, successful response
    // so the map quietly never finishes loading - a state the app already
    // handles without erroring - and the API is never actually called, so
    // this no longer costs anything either. Real users never hit this path;
    // they load the real script from the promoted custom domain, which the
    // Maps key's referrer restriction already allows.
    await page.route("https://maps.googleapis.com/**", (route) =>
        route.fulfill({ status: 200, contentType: "application/javascript", body: "" })
    );

    page.on("pageerror", (err) => errors.push(`Uncaught exception: ${err.message}`));
    page.on("console", (msg) => {
        if (msg.type() === "error") {
            errors.push(`Console error: ${msg.text()}`);
        }
    });

    await page.goto(url, { waitUntil: "load", timeout: 30_000 });

    const locationInput = page.locator("#location-input");
    const formVisible = await locationInput
        .waitFor({ state: "visible", timeout: 15_000 })
        .then(() => true)
        .catch(() => false);

    if (!formVisible) {
        errors.push("Location search form (#location-input) did not appear");
    } else {
        await locationInput.fill(SEARCH_LOCATION);
        await page.locator("#location-submit").click();

        const locationName = page.locator(".location-name");
        const resultVisible = await locationName
            .waitFor({ state: "visible", timeout: 25_000 })
            .then(() => true)
            .catch(() => false);

        if (!resultVisible) {
            errors.push(`Weather result did not appear after searching for "${SEARCH_LOCATION}"`);
        } else {
            const resultText = await locationName.textContent();
            if (!EXPECTED_LOCATION_TEXT.test(resultText ?? "")) {
                errors.push(`Weather result location "${resultText}" did not match expected search "${SEARCH_LOCATION}"`);
            }
        }
    }

    if (errors.length > 0) {
        console.error(`Smoke test FAILED for ${url}:`);
        for (const message of errors) {
            console.error(`  - ${message}`);
        }
        process.exit(1);
    }

    console.log(`Smoke test passed for ${url}`);
} finally {
    await browser.close();
}
