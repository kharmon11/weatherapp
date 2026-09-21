import { chromium } from "playwright";

const url = process.argv[2];
if (!url) {
    console.error("Usage: node smoke-test.mjs <url>");
    process.exit(1);
}

// A fixed, unambiguous location so geocoding results are consistent between runs.
const SEARCH_LOCATION = "Boston, MA";
const EXPECTED_LOCATION_TEXT = /boston/i;

// The deployed candidate's Google Map can never load: the Maps JS key's HTTP
// referrer restriction can't be wildcarded to cover the ephemeral per-deploy
// hostname (Google doesn't support wildcarding mid-label - a real config, not
// a bug), so it's expected to fail here specifically. Real users only ever
// hit the promoted custom domain, which the key already allows. Scoped to
// this one named Google error so any other, unrelated console error still
// fails the test. (Based on Google's documented error name for this exact
// condition - not something reproducible in dev without a referrer-restricted
// production key, so double-check this pattern against the actual console
// text if it ever stops matching.)
const IGNORED_CONSOLE_ERROR_PATTERNS = [/RefererNotAllowedMapError/];

const errors = [];

// Submitting a search mounts the Google Map, which needs WebGL for vector
// tiles. Headless Chromium has no GPU by default, so without these flags Maps
// falls back to raster tiles and logs that fallback as a console error -
// a false positive unrelated to app health. SwiftShader gives it software
// WebGL so it renders the same way it would for a real user.
const browser = await chromium.launch({
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"]
});
try {
    const page = await browser.newPage();

    page.on("pageerror", (err) => errors.push(`Uncaught exception: ${err.message}`));
    page.on("console", (msg) => {
        if (msg.type() === "error") {
            const text = msg.text();
            if (IGNORED_CONSOLE_ERROR_PATTERNS.some((pattern) => pattern.test(text))) {
                return;
            }
            errors.push(`Console error: ${text}`);
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
