const puppeteer = require('puppeteer');

const url = 'https://www.bing.com/travel/flight-search?q=flights+from+pnq-blr&src=pnq&des=blr&ddate=2024-12-16&isr=0&rdate=2024-12-19&cls=0&adult=1&child=0&infant=0&form=FLAFLI&entrypoint=FBSCOP';
const wanted_price = 5000;

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Set a user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    let retries = 3;

    while (retries > 0) {
        try {
            // Navigate to the URL
            await page.goto(url, { waitUntil: 'domcontentloaded' });

            // Wait for the price element to appear
            await page.waitForSelector('.bt-custom-pivot-sub-text', { timeout: 10000 });

            // Get the price
            const price = await page.$eval('.bt-custom-pivot-sub-text', el => el.innerText);
            console.log('Price Found:', price);
            break; // Exit loop if successful

        } catch (error) {
            if (error.message.includes('429')) {
                console.log('Received 429 error. Retrying after a delay...');
                await new Promise(res => setTimeout(res, 5000)); // Delay before retrying
                retries--;
            } else {
                console.error('An error occurred:', error.message);
                break;
            }
        }
    }

    await browser.close();
})();
