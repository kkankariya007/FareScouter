const puppeteer = require('puppeteer');
const nodemailer = require ("nodemailer"); 
require ("dotenv").config();

// console.log(process.env.hell)

// console.log(process.env.APP_PASSWORD)

const path = require("path");

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({

    service: 'gmail',
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.hell,
        pass: process.env.APP_PASSWORD,
    },
    // tls: {
    //     servername: "smtp.gmail.com",
    //     rejectUnauthorized: true,
    //     minVersion: "TLSv1.2"
    //     // Disable certificate validation
    // },
});

const url = 'https://www.bing.com/travel/flight-search?q=flights+from+bom-dxb&src=bom&des=dxb&ddate=2024-09-13&isr=0&rdate=2024-12-19&cls=0&adult=1&child=0&infant=0&form=FLAFLI&entrypoint=FBSCOP';
const wanted_price = 15000;

(async () => {
    const browser = await puppeteer.launch({headless: false, slowMo:100, args: ['--start-maximized'], defaultViewport:null});
    const page = await browser.newPage();
    console.log(page.viewport())
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
                timeout: 30000 // Optional: Increase timeout if needed
            });

            console.log("Hello");

            
            await page.waitForSelector('.bt-custom-pivot-sub-text', { timeout: 10000 });
// Get all instances of the selector
            const prices = await page.$$eval('.bt-custom-pivot-sub-text', els => els.map(el => el.innerText));
            console.log(prices)
        
            const convertPrice = (priceString) => {
                if (priceString) {
                    return parseFloat(priceString.replace(/₹|,/g, '').trim());
                }
                return null;
            };
        
            if (prices) {
                const bestPrice = prices[0];
                const cheapestPrice = prices[1];
                console.log('Best Price Found:', bestPrice);
                console.log('Cheapest Price Found:', cheapestPrice);
                const bestPriceNumber = convertPrice(bestPrice);

                const cheapestPriceNumber = convertPrice(cheapestPrice);

                // console.log('Price Found:', price);
                // console.log('Price as Number:', priceNumber);
        
                if (bestPriceNumber < wanted_price || cheapestPriceNumber<wanted_price) {

                    //clicking price button
                    await page.waitForSelector('.itineraryCardContainer', { timeout: 10000 });
                    const containerHandle = await page.$('.itineraryCardContainer');
                    if (containerHandle) {
                        console.log('Container element found, searching for the button inside.');

                        const buttonHandle = await containerHandle.$('.ms-Button.ms-Button--primary.flight-select-btn');
                        if (buttonHandle) {
                            console.log('Button found, scrolling it into view.');
                            console.log('Button is visible and ready to be clicked.');
                            await buttonHandle.click();
                            const newUrl = page.url();
                            console.log('New URL after clicking the button:', newUrl);
                        } else {
                            console.log('Button not found inside the container.');
                        }
                    } else {
                        console.log('Container element not found.');
                    }
                    //button click




                    const mailOptions = {
                        from: {
                            name: 'Hello from Flight Scouter', 
                            address: process.env.hell,
                        }, // sender address

                        to: ["kkankariya007@gmail.com","kkankariya007@yahoo.com","kkankariya27012002@gmail.com","kk3288@srmist.edu.in"], 
                        subject: "Sliding in, a drop in flight price :)",
                        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    background-color: black;
                    color: white;
                    font-family: monospace;
                    white-space: pre;
                    text-align: center;
                }
                .star {
                    color: blue;
                }
            </style>
        </head>
        <body>
        <pre>
              *     *      *   *     *  *     *   *     *
              *     *     *       *  *     *   *     *
        *     *     *       __|__    *     *     *     * 
        *     *      *   --o--o--o---    *     *  *     * 
           *     *       *     *   *     *  *     *
          *     *      *     *   *     *    *     *
        </pre>
        <h3>For your Flight from Bengaluru to Dubai, on 5th December,2024</h2>
        <h3> Fare Scouter got you a deal which is less than Rs.${wanted_price}.</h3><br>
        <h3>Cheapest price: Rs.<strong>${cheapestPriceNumber}</strong>.</h2><br>
        <h3>However the more preferrable flight is priced at: Rs.<strong>${bestPriceNumber}</strong>.</h2><br>
        <strong>Here's the link to book the flight:</strong><br/><a href="https://www.goindigo.in/book/flight-select.html?flightNumber=1485&skyscanner_redirectid=RuWHkJe_Ee-Hyy-6p3gGMw&cid=metasearch|skyscanner" target="_blank">Book Flight</a>
        </body>
        </html>`
                        // html:htmlContent,
                        // html: `<h1>Price is <strong>${priceNumber}</strong>, which is lower than the wanted price of <strong>${wanted_price}</strong>.</h1>`,

                    }
                    const sendMail = async(transporter,mailOptions) => {
                        try{
                            await transporter.sendMail(mailOptions)
                            console.log("Email sent")

                    }catch(error){
                        console.log(error)
                        }
                    }
                    // Call the sendMail function
                    sendMail(transporter, mailOptions);

                //    console.log('price is '+priceNumber+' lower than the expected price of '+wanted_price)
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
