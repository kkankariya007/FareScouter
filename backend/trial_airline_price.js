const puppeteer = require('puppeteer');
require ("dotenv").config();
const { link } = require('fs');

const path = require("path");
const url = 'https://www.bing.com/travel/flight-search?q=flights+from+bom-blr&src=bom&des=blr&ddate=2024-12-16&isr=0&rdate=2024-12-19&cls=0&adult=1&child=0&infant=0&form=FLAFLI&entrypoint=FBSCOP';


let flightData=[];
(async () => {
    const browser = await puppeteer.launch({
        headless: false, 
        slowMo:20, 
        args: ['--start-maximized'],
        defaultViewport:null
    });
    const page = await browser.newPage();
    // console.log(page.viewport())
    // Set a user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Set cookies
    const cookies = [
        {
            name: 'cookie_name1', 
            value: 'cookie_value1',
            domain: '.bing.com', 
            path: '/', 
            httpOnly: true, 
            secure: true 
        },
        {
            name: 'cookie_name2',
            value: 'cookie_value2',
            domain: '.bing.com',
            path: '/',
            httpOnly: true,
            secure: true
        },
        // Add more cookies as needed
    ];

    await page.setCookie(...cookies);

        try {
            await page.goto(url, { waitUntil: 'domcontentloaded' });
            // ms-ProgressIndicator-itemProgress itemProgress-171
            await page.waitForSelector('.ms-ProgressIndicator.root-168', { 
                hidden: true, // Wait until the element disappears
                timeout: 300000 // Optional: Increase timeout if needed
            });

            console.log("Hello");

            //flight non-stop open


            await page.waitForSelector('.flights-filters', { timeout: 20000 });

            // Find all occurrences of the flights-filters container
            const flightFilterHandles = await page.$$('.flights-filters');
            
            if (flightFilterHandles.length > 0) {
                await page.waitForSelector('input[type="checkbox"][aria-label="Non-stop"]', { timeout: 10000 });

                    // Find and click the checkbox with the aria-label "Non-stop"
                    const checkboxHandleNonStop = await page.$('input[type="checkbox"][aria-label="Non-stop"]');

                    if (checkboxHandleNonStop) {
                        console.log('Checkbox with aria-label "Non-stop" found, clicking it.');
                        await checkboxHandleNonStop.click();
                    } else {
                        console.log('Checkbox with aria-label "Non-stop" not found.');
                    }

                    await page.waitForSelector('input[type="checkbox"][aria-label="Air India"]', { timeout: 20000 });

                    // Find and click the checkbox with the aria-label "Air India"
                    const checkboxHandleAirIndia= await page.$('input[type="checkbox"][aria-label="Air India"]');
                    if (checkboxHandleAirIndia) {
                        console.log('Checkbox with aria-label "Air India" found, clicking it.');
                        await checkboxHandleAirIndia.click();
                    } else {
                        console.log('Checkbox with aria-label "Air India" not found.');
                    }


            } else {
                console.log('No flights-filters containers found.');
            }


                    await page.waitForSelector('.itineraryCardContainer', { timeout: 10000 });
                    const containerHandle = await page.$('.itineraryCardContainer');
                    
                    if (containerHandle) {

                        const buttons = await page.$$(
                            '.ms-Button.ms-Button--primary.flight-select-btn.desktopOnly'
                          );
                        
                          // Check if there are at least 2 buttons
                          if (buttons.length >= 1) {
                            console.log(buttons.length)
                            // Click on the first occurrence
                            for(let i=0;i<buttons.length;i++){
                                const buttons = await page.$$(
                                    '.ms-Button.ms-Button--primary.flight-select-btn.desktopOnly'
                                );
                                await buttons[i].click();
                                console.log(`Clicked on the ${i} button.`);
                                await page.waitForSelector('.ms-Spinner.priceSpinner.root-208', { 
                                    hidden: true, // Wait until the element disappears
                                    timeout: 30000 // Optional: Increase timeout if needed
                                });
try{
                                await page.waitForSelector('.bookingOptions');
                       
                                const itrFlightTextHandles = await page.$$('.ms-TooltipHost.root-191');
                                const itrFlightPriceHandles = await page.$$('.providerPrice');
                                if (itrFlightPriceHandles.length > 0) {
                                    // console.log(`Found ${itrFlightTextHandles.length} itrFlightText elements.`);
                                    for (let j = 0; j < 3; j++) {
                                        // Check if the j-th element exists in itrFlightTextHandles
                                        if (j < itrFlightPriceHandles.length) {
                                            const extractedText = await page.evaluate(element => {
                                                const text = element.textContent.trim();
                                                // Regex to match a word before "Book"
                                                const match = text.match(/([A-Za-z0-9.]+)(?=Book)/);
                                                return match ? match[0] : "NA";  // Return the matched OTA name, or "NA" if not found
                                            }, itrFlightTextHandles[j]);
                                            // const extractedText = await page.evaluate(element => element.textContent.trim(), itrFlightTextHandles[j]);
                                            // console.log(extractedText);
                                            const extractedPrice = await page.evaluate(element => element.textContent.trim(), itrFlightPriceHandles[j]);
                                            // console.log(extractedPrice)
                                            flightData.push(extractedText,extractedPrice);
                                        } else {
                                            flightData.push("NA",0)
                                            // console.log("NA");
                                        }
                                    }
                                }
                                console.log(flightData)

                               await page.goBack();
                            }catch(error){
                                console.log("Error: .bookingOptions not found or another error occurred:", error);
                                await page.goBack();
                            }
                                console.log('Went back to the previous screen.');

                            }
                        }
                    }

                 
                    
            
           
            

        } catch (error) {
            if (error.message.includes('429')) {
                console.log('Received 429 error. Retrying after a delay...');
                await new Promise(res => setTimeout(res, 5000)); // Delay before rrying
            } else {
                console.error('An error occurred:', error.message);
            }
        }

    // await browser.close();
})();



// Base URL format
