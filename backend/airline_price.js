const puppeteer = require('puppeteer');
require ("dotenv").config();
const mariadb = require('mariadb');
const { link } = require('fs');
const pool = mariadb.createPool({
    host: '172.16.4.28',  // Change this if you're using a remote database
    user: 'bfmprd',  // Replace with your MariaDB username
    password: 'ad7ert74',  // Replace with your MariaDB password
    database: 'ownbfmprd', 
    port: 3465, // Your database name
    connectionLimit: 5
  });
const board='MAA'
const off='BLR'
const path = require("path");
const url='https://www.bing.com/travel/flight-search?q=flights+from+maa-blr&src=maa&des=blr&ddate=2024-12-16&isr=0&rdate=&cls=0&adult=1&child=0&infant=0&form=FBSCOP&entrypoint=FBSCOP';
// const url = 'https://www.bing.com/travel/flight-search?q=flights+from+bom-blr&src=maa&des=blr&ddate=2024-12-16&isr=0&rdate=2024-12-19&cls=0&adult=1&child=0&infant=0&form=FLAFLI&entrypoint=FBSCOP';


let flightDetails=[],originhoursArray=[],originminutesArray=[],destinationhoursArray=[],destinationminutesArray=[],flightData=[];
(async () => {
    const browser = await puppeteer.launch({
        headless: false, 
        slowMo: 10, 
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

            await page.waitForSelector('.ms-ProgressIndicator.root-168', { 
                hidden: true, // Wait until the element disappears
                timeout: 300000 // Optional: Increase timeout if needed
            });

            console.log("Hello");

            //flight non-stop open


            await page.waitForSelector('.flights-filters', { timeout: 30000 });

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

                    await page.waitForSelector('input[type="checkbox"][aria-label="Air India"]', { timeout: 10000 });

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
                        console.log('Container element found, searching for icon buttons inside.');
                       
                        // Find all icon elements with the specified classes within the container
                        const iconHandles = await containerHandle.$$('.ms-Icon.root-90.css-232.ms-Button-icon');
                        console.log(iconHandles.length)
                        if (iconHandles.length > 0) {
                            console.log(`Found ${iconHandles.length} icons, clicking each one.`);
                            for (let i = 0; i < iconHandles.length; i+=2) {
                                // console.log(`Clicking icon ${i + 1}...`);
                                await iconHandles[i].click();
                                
                                // Optionally, wait for a brief period after each click to ensure the page updates if needed
                                // await page.waitForTimeout(500); // Adjust the timeout as needed
                            }
                        } else {
                            console.log('No icons found inside the container.');
                        }
                    } else {
                        console.log('Container element not found.');
                    }


            flightDetails = []; // Array to store flight codes and numbers


            const itrFlightTextHandles = await page.$$('.itrFlightText');
            if (itrFlightTextHandles.length > 0) {
                // console.log(`Found ${itrFlightTextHandles.length} itrFlightText elements.`);

                // Loop over each itrFlightText and extract its content
                for (let j = 0; j < itrFlightTextHandles.length; j++) {
                    const extractedText = await page.evaluate(element => element.textContent.trim(), itrFlightTextHandles[j]);
                    // console.log(`Extracted text from itrFlightText ${j + 1}: ${extractedText}`);
                    const match = extractedText.match(/([A-Z]{2})\s*(\d+)/);
                    if (match) {
                        // Combine airline code and flight number into a string and add to the array
                        flightDetails.push(match[2]);
                    }
                }
            } else {
                console.log('No itrFlightText elements found after clicking.');
            }

            const fltTimeDetailsHandles = await page.$$('.flt_timeDetails');
            if (fltTimeDetailsHandles.length > 0) {
                // console.log(`Found ${fltTimeDetailsHandles.length} flt_timeDetails elements.`);
            
                 originhoursArray = []; // Array to store hours
                 originminutesArray = []; // Array to store minutes
                 destinationhoursArray = []; // Array to store hours
                 destinationminutesArray = []; 
            
                // Function to convert 12-hour format time to 24-hour format
                function convertTo24HourFormat(timeString) {
                    const [time, period] = timeString.split(/\s+/); // Split time and period (e.g., "9:30 pm")
                    let [hours, minutes] = time.split(':').map(Number);
            
                    if (period.toLowerCase() === 'pm' && hours !== 12) {
                        hours += 12; // Convert PM hours to 24-hour format (except for 12 PM)
                    }
                    if (period.toLowerCase() === 'am' && hours === 12) {
                        hours = 0; // Convert 12 AM to 0 hours
                    }
            
                    return [hours.toString().padStart(2, '0'), minutes.toString().padStart(2, '0')];
                }
            
                // Loop over each flt_timeDetails and extract its content
                for (let j = 0; j < fltTimeDetailsHandles.length; j ++) {
                    if(j%2==0){
                    const extractedText = await page.evaluate(element => element.textContent.trim(), fltTimeDetailsHandles[j]);
                    // console.log(`Extracted text from flt_timeDetails ${j + 1}: ${extractedText}`);
            
                    // Convert the time string and store the result in separate arrays
                    const [hours, minutes] = convertTo24HourFormat(extractedText);
                    originhoursArray.push(hours);
                    originminutesArray.push(minutes);
                    }
                    else{

                        const extractedText = await page.evaluate(element => element.textContent.trim(), fltTimeDetailsHandles[j]);
                    // console.log(`Extracted text from flt_timeDetails ${j + 1}: ${extractedText}`);
            
                    // Convert the time string and store the result in separate arrays
                    const [hours, minutes] = convertTo24HourFormat(extractedText);
                    destinationhoursArray.push(hours);
                    destinationminutesArray.push(minutes);

                    }
                }
                console.log(`Flight Number: ${flightDetails}`);
                console.log(`Extracted being hours: ${originhoursArray}`);
                console.log(`Extracted begin minutes: ${originminutesArray}`);

                console.log(`Extracted destination hours: ${destinationhoursArray}`);
                console.log(`Extracted destination minutes: ${destinationminutesArray}`);

            } else {
                console.log('No flt_timeDetails elements found after clicking.');
            }
            await page.waitForSelector('.itineraryCardContainer', { timeout: 10000 });
            const containerHandle2 = await page.$('.itineraryCardContainer');
            
            if (containerHandle2) {

                const buttons = await page.$$(
                    '.ms-Button.ms-Button--primary.flight-select-btn.desktopOnly.root-230'
                );
                
                  // Check if there are at least 2 buttons
                  if (buttons.length >= 1) {
                    // Click on the first occurrence
                    console.log("Hello   "+buttons.length)
                    for(let i=0;i<buttons.length;i++){
                        const buttons = await page.$$(
                            // ms-Button ms-Button--primary flight-select-btn desktopOnly root-230
                            '.ms-Button.ms-Button--primary.flight-select-btn.desktopOnly.root-230'
                        );
                        await buttons[i].click();
                        console.log(`Clicked on the ${i} button.`);
                        await page.waitForSelector('.ms-Spinner.priceSpinner.root-208', { 
                            hidden: true, // Wait until the element disappears
                            timeout: 30000 // Optional: Increase timeout if needed
                        });



                        try {
                            await page.waitForSelector('.bookingOptions');
                            
                            const itrFlightTextHandles = await page.$$('.ms-TooltipHost.root-191');
                            const itrFlightPriceHandles = await page.$$('.providerPrice');
                            
                            if (itrFlightPriceHandles.length > 0) {
                                // console.log(`Found ${itrFlightTextHandles.length} itrFlightText elements.`);
                                for (let j = 0; j < 3; j++) {
                                    try {
                                        // Check if the j-th element exists in itrFlightPriceHandles
                                        if (j < itrFlightPriceHandles.length) {
                                            const extractedText = await page.evaluate(element => {
                                                const text = element.textContent.trim();
                                                // Regex to match a word before "Book"
                                                const match = text.match(/([A-Za-z\s\.]+)(?=Book)/);
                                                return match ? match[0] : "NA";  // Return the matched OTA name, or "NA" if not found
                                            }, itrFlightTextHandles[j]);
                                            const convertPrice = (priceString) => {
                                                if (priceString) {
                                                    return priceString.replace(/₹|,/g, '').trim();
                                                }
                                                return null;
                                            };

                                            const extractedPrice = await page.evaluate(element => element.textContent.trim(), itrFlightPriceHandles[j]);
                                            const extractedPriceNumber=convertPrice(extractedPrice);
                                            flightData.push(extractedText, extractedPriceNumber);
                                        } else {
                                            flightData.push("NA", 0);
                                        }
                                    } catch (err) {
                                        console.log(`Error processing flight data for index ${j}:`, err);
                                        flightData.push("NA", 0);  // Push NA in case of error in processing a specific flight
                                    }
                                }
                            }
                            // console.log(flightData);
                        
                            await page.goBack();
                        } catch (error) {
                            console.log("Error: .bookingOptions not found or another error occurred:", error);

                            await page.goBack();
                        }
                        console.log(flightData);


                        console.log('Went back to the previous screen.');

console.log("Hello")
                   
                    }
                }
            }
    
            
            const result = [];

                    for (let i = 0; i < flightDetails.length; i++) {
                        const flightNumber = flightDetails[i];
                        const beginHour = originhoursArray[i];
                        const beginMinute = originminutesArray[i];
                        const beginformattedTime = `${beginHour}:${beginMinute}:00`;

                        const destinationHour = destinationhoursArray[i];
                        const destinationMinute = destinationminutesArray[i];
                        const destinationformattedTime = `${destinationHour}:${destinationMinute}:00`;


                        // Each flight will have three OTA names and prices, based on the corresponding entries in the `otas` array
                        const otaStartIndex = i * 6; // 6 because there are 3 OTAs (name + price) pairs per flight

                        // Extracting 3 OTAs (name and price pairs) for this flight
                        const ota1 = [flightData[otaStartIndex], flightData[otaStartIndex + 1]];
                        const ota2 = [flightData[otaStartIndex + 2], flightData[otaStartIndex + 3]];
                        const ota3 = [flightData[otaStartIndex + 4], flightData[otaStartIndex + 5]];
                    
                        const flightDate = new Date('2024-12-16');

                        // Push the formatted data into the result array
                        result.push([
                        flightDate,
                        flightNumber,
                        board,
                        off,
                        beginformattedTime, 
                        destinationformattedTime, 
                        ota1[0], ota1[1], 
                        ota2[0], ota2[1], 
                        ota3[0], ota3[1]
                        ]);
                    }


                    console.log(result)
                    let connection;
                    try {
                        // Get a connection from the pool
                        connection = await pool.getConnection();

                        // Insert each flight's data into the database
                        for (const flight of result) {
                        const query = `
                            INSERT INTO ai_fare (Date, FN, Board, Off, DTime, ATime, N1, OTA1, N2, OTA2, N3, OTA3)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `;
                        
                        const values = [
                            flight[0],
                            flight[1],
                            flight[2],
                            flight[3],
                            flight[4],
                            flight[5],
                            flight[6],
                            flight[7],
                            flight[8],
                            flight[9],
                            flight[10],
                            flight[11]
                        ];

                        // Execute the query with the values
                        await connection.query(query, values);
                        console.log(`Inserted flight ${flight[0]} into the database.`);
                        }
                    } catch (err) {
                        console.error('Error inserting flight data:', err);
                    } finally {
                        // Release the connection back to the pool
                        if (connection) {
                        connection.release();
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

    await browser.close();
})();



// Base URL format
