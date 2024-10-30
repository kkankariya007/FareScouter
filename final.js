const puppeteer = require('puppeteer');
const nodemailer = require ("nodemailer"); 
require ("dotenv").config();

console.log(process.env.hell)

console.log(process.env.APP_PASSWORD)

const path = require("path");

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({

    service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.hell,
        pass: process.env.APP_PASSWORD,
    },
    // tls: {
    //     rejectUnauthorized: false // Disable certificate validation
    // },
});

const url = 'https://www.bing.com/travel/flight-search?q=flights+from+pnq-blr&src=pnq&des=blr&ddate=2024-11-10&isr=0&rdate=2024-12-19&cls=0&adult=1&child=0&infant=0&form=FLAFLI&entrypoint=FBSCOP';
const wanted_price = 6000;

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set a user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Set cookies
    const cookies = [
        {
            name: 'cookie_name1', // Replace with actual cookie name
            value: 'cookie_value1', // Replace with actual cookie value
            domain: '.bing.com', // Replace with actual domain
            path: '/', // Path for the cookie
            httpOnly: true, // Set to true if the cookie is HTTP-only
            secure: true // Set to true if the cookie is secure
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
            // Navigate to the URL
            await page.goto(url, { waitUntil: 'domcontentloaded' });

            // Wait for the price element to appear
            await page.waitForSelector('.bt-custom-pivot-sub-text', { timeout: 10000 });

            // Get the price
            const price = await page.$eval('.bt-custom-pivot-sub-text', el => el.innerText);
            // console.log('Price Found:', price);

            const convertPrice = (priceString) => {
                if (priceString) {
                    // Remove the rupee sign and commas, then convert to number
                    return parseFloat(priceString.replace(/₹|,/g, '').trim());
                }
                return null;
            };
        
            // Check if the price was found
            if (price) {
                const priceNumber = convertPrice(price);
                // console.log('Price Found:', price);
                // console.log('Price as Number:', priceNumber);
        
                // Example comparison with wanted price
                if (priceNumber < wanted_price) {

                    const mailOptions = {
                        from: {
                            name: 'Hello from Flight Scouter', 
                            address: process.env.hell,
                        }, // sender address
                        to: ["kkankariya007@yahoo.com"], 
                        subject: "Send email for drop in flight price :)",
                        html: `<h1>Price is <strong>${priceNumber}</strong>, which is lower than the wanted price of <strong>${wanted_price}</strong>.</h1>`,

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

                   console.log('price is '+priceNumber+' lower than the expected price of '+wanted_price)
                } else {
                    console.log('Price is higher than or equal to the wanted price.'+priceNumber);
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
