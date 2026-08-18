import { chromium } from "playwright";

const url = process.argv[2];
if (!url) {
    console.error("Usage: node smoke-test.mjs <url>");
    process.exit(1);
}

const errors = [];

const browser = await chromium.launch();
try {
    const page = await browser.newPage();

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
