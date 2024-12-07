const puppeteer = require('puppeteer');
const nodemailer = require("nodemailer");
require("dotenv").config();
const express = require('express');
const app = express();
const port = 3000; 
app.use(express.json());

// SMTP transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.hell,
        pass: process.env.APP_PASSWORD,
    },
});

// Function to track flight price and send email if the price is lower than expected
const trackFlightPrice = async (wanted_price) => {
    const http = require('http'); // Use the http module

    // URL you want to ping
    const nearbyUrl = 'http://localhost:3000/?location=PNQ&radius=200';
    let data = ''; 
    let nearbyAirports = {};

    // Use a Promise wrapper for the HTTP request
    const getNearbyAirports = () => {
        return new Promise((resolve, reject) => {
            http.get(nearbyUrl, (res) => {
                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const airports = JSON.parse(data);
                        nearbyAirports = {};

                        for (let i = 1; i < 3 && i < airports.length; i++) {  // Start at 1 and get 2 more after that
                            const airport = airports[i];
                            if (airport.iataCode) {
                                nearbyAirports[airport.iataCode] = airport.name;  // Store IATA code as key, name as value
                            }
                        }

                        resolve(nearbyAirports);  // Resolve with the nearbyAirports data
                    } catch (error) {
                        
                        reject('Error parsing response');
                    }
                });
            }).on('error', (error) => {
                reject('Error making request: ' + error.message);
            });
        });
    };

    try {
        // Get nearby airports asynchronously
        nearbyAirports = await getNearbyAirports();
        console.log(nearbyAirports)
        // Initialize Puppeteer browser
        const browser = await puppeteer.launch({
            headless: false, 
            slowMo:10,
            args: ['--start-maximized'],
            defaultViewport: null
        });

        for (let iataCode in nearbyAirports) {
            const url = `https://www.bing.com/travel/flight-search?q=flights+from+${iataCode}-lhr&src=${iataCode}&des=lhr&ddate=2025-01-16&isr=0&rdate=2024-12-19&cls=0&adult=1&child=0&infant=0&form=FLAFLI&entrypoint=FBSCOP`;

            
            const page = await browser.newPage();
            
            // Set user-agent and cookies if necessary
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            
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
            ];

            await page.setCookie(...cookies);

            try {
                // Navigate to the URL and wait for elements to load
                await page.goto(url, { waitUntil: 'domcontentloaded' });
                await page.waitForSelector('.ms-ProgressIndicator.root-168', { 
                    hidden: true,
                    timeout: 300000 // Increase timeout if necessary
                });

                await page.waitForSelector('.bt-custom-pivot-sub-text', { timeout: 100000 });
                const prices = await page.$$eval('.bt-custom-pivot-sub-text', els => els.map(el => el.innerText));
                
                const convertPrice = (priceString) => {
                    return priceString ? parseFloat(priceString.replace(/₹|,/g, '').trim()) : null;
                };


                if (prices) {
                    const bestPrice = prices[0];
                    const cheapestPrice = prices[1];
                    const bestPriceNumber = convertPrice(bestPrice);
                    const cheapestPriceNumber = convertPrice(cheapestPrice);

                    console.log(bestPriceNumber);
                    console.log(cheapestPriceNumber);
                    if (bestPriceNumber < wanted_price || cheapestPriceNumber<wanted_price) {
                        let newUrl23,newUrl234;
                        //clicking price button-best price
                        await page.waitForSelector('.itineraryCardContainer', { timeout: 10000 });
                        const containerHandle = await page.$('.itineraryCardContainer');
                        if (containerHandle) {
                            console.log('Container element found, searching for the button inside.');
                           
                            const buttonHandle = await containerHandle.$('.ms-Button.ms-Button--primary.flight-select-btn');
                            if (buttonHandle) {
                                console.log('Button is visible and ready to be clicked.');
                                await buttonHandle.click();
                                const newUrl = page.url();
                                console.log('New URL after clicking the button:', newUrl);
    
                                await page.waitForSelector('.ms-Spinner.priceSpinner.root-208', { 
                                    hidden: true, // Wait until the element disappears
                                    timeout: 30000 // Optional: Increase timeout if needed
                                });
                                console.log("can find fare now")
                                
                                await page.waitForSelector('.ms-Button.ms-Button--primary.bookBtn');
                                
    
                                    const [newPage] = await Promise.all([
                                        new Promise(resolve => browser.once('targetcreated', target => resolve(target.page()))),
                                        page.click('.ms-Button.ms-Button--primary.bookBtn')
                                    ]);
                            
                                    // // Wait for the new page to load content
                                    // await newPage.waitForNavigation();
                            
                                    // Get the URL of the new page
                                    newUrl23 = newPage.url();
                            
                                    // Print the new URL
                                    console.log('New URL after clicking the button:', newUrl23);
                                    await page.bringToFront();
                                    console.log('Switched back to the original tab.');
                                    await page.goBack();
                                    console.log("Went back to the previous screen.");
                                    
                                    //code to click on the cheapest button
                                    await page.waitForSelector('.bt-custom-pivot-value');
                                    const elements = await page.$$('.bt-custom-pivot-value');                            
                                    if (elements.length >= 2) {
                                        await elements[1].click();
                                        console.log('Clicked on the second bt-custom-pivot-value element.');
                                    }
    
    
                                    await page.waitForSelector('.itineraryCardContainer', { timeout: 10000 });
                                    const containerHandle = await page.$('.itineraryCardContainer');
                                    if (containerHandle) {
                                        console.log('Container element found, searching for the button inside.');
                                        const buttonHandle = await containerHandle.$('.ms-Button.ms-Button--primary.flight-select-btn');
                                    if (buttonHandle) {
                                        console.log('Button is visible and ready to be clicked.');
                                        await buttonHandle.click();
                                        const newUrl = page.url();
                                        console.log('New URL after clicking the button:', newUrl);
    
                                        await page.waitForSelector('.ms-Spinner.priceSpinner.root-208', { 
                                            hidden: true, // Wait until the element disappears
                                            timeout: 30000 // Optional: Increase timeout if needed
                                        });
                                        console.log("can find fare now")
                                        
                                        await page.waitForSelector('.ms-Button.ms-Button--primary.bookBtn');
                                        
    
                                            const [newPage] = await Promise.all([
                                                new Promise(resolve => browser.once('targetcreated', target => resolve(target.page()))),
                                                page.click('.ms-Button.ms-Button--primary.bookBtn')
                                            ]);
                                    
                                            // // Wait for the new page to load content
                                            // await newPage.waitForNavigation();
                                    
                                            console.log("YOYO")
                                            newUrl234 = newPage.url();
                                    
                                            // Print the new URL
                                            console.log('New URL after clicking the button:', newUrl234);
                                        }
                                        else
                                        console.log("Second button not found inside the container");
                                    }
                                    else
                                    console.log("Cheapest container not found");
    
    
    
    
    
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
<html>
<head>
  <title>Flight Price Alert</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border: 1px solid #ddd;
      border-radius: 12px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background-color: #005eb8;
      color: #ffffff;
      text-align: center;
      padding: 20px;
      font-size: 26px;
      font-weight: bold;
    }
    .content {
      padding: 20px;
      text-align: center;
    }
    .content img {
      max-width: 80%;
      margin: 20px auto;
      border-radius: 8px;
      display: block;
    }
    .option-container {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 20px;
    }
    .option {
      width: 90%;
      max-width: 260px;
      background-color: #f9f9f9;
      border: 1px solid #ddd;
      border-radius: 12px;
      padding: 15px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    .option h3 {
      font-size: 18px;
      color: #005eb8;
      margin-bottom: 10px;
    }
    .option p {
      font-size: 14px;
      color: #333;
      margin: 8px 0;
    }
    .highlight {
      color: #005eb8;
      font-weight: bold;
    }
    .savings {
      font-size: 22px;
      font-weight: bold;
      color: #4caf50; /* Softer green for "You Save" */
      margin: 15px 0;
      background: #f0fdf4; /* Light green background */
      padding: 10px;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(76, 175, 80, 0.2); Subtle shadow
    }
    .book-button {
      display: inline-block;
      background-color: #005eb8;
      color: #ffffff;
      text-decoration: none;
      padding: 10px 25px;
      border-radius: 6px;
      font-size: 16px;
      margin-top: 10px;
      transition: background-color 0.3s ease;
    }
    .book-button:hover {
      background-color: #004080;
    }
    .foter {
      background-color: #f4f4f4;
      text-align: center;
      padding: 15px;
      font-size: 14px;
      color: #888;
    }
    @media (max-width: 600px) {
      .option-container {
        flex-direction: column;
        align-items: center;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="content">
      <p style="font-size: 18px; color: #555;">✈️ Sliding in, Exclusive prices for you 😁</p>
      <!-- Flight Image -->
     <img src="cid:flight.jpg"/>
    <h3>Based on nearest airport preferrence, Flight Scouter got you a cheaper from Mumbai to London, on 16th January,2025 instead of Pune to London</h2>

        <!-- Best Flight Option -->
        <div class="option">
          <h3 class="savings">🎉 You Save: ₹${wanted_price-bestPriceNumber} with our Best price of: ₹${bestPriceNumber}</h1>
          <a href="${newUrl23}" class="book-button">    Book Now</a>
        </div>
        <div class="option-container">
        <!-- Cheapest Flight Option -->
        <div class="option">
          <h3 class="savings">🎉 You Save: ₹${wanted_price - cheapestPriceNumber} with our Cheapest price of: ₹${cheapestPriceNumber}</h1>
          <a href="${newUrl234}" class="book-button">   Book Now</a>
        </div>
      </div>
      <p style="margin-top: 20px; font-size: 14px; color: #777;">Hurry! We are holding these prices for you.</p>
    </div>
    <div class="foter">
      <p>Powered by FareScouter | Never miss a Deal. Happy traveling!</p>
    </div>
  </div>
</body>
</html>`,
attachments: [{
    filename: 'flight.jpg',
    path: 'flight.jpg',
    cid: 'flight.jpg',
    contentType:'image/jpg' //same cid value as in the html img src
}]
    
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
                    }
                }

            } catch (error) {
                if (error.message.includes('429')) {
                    console.log('Received 429 error. Retrying after a delay...');
                    await new Promise(res => setTimeout(res, 5000)); // Delay before retrying
                } else {
                    console.error('An error occurred:', error.message);
                }
                result = 'Error occurred';
            }
        }

        await browser.close();
    } catch (error) {
        console.error('Failed to get nearby airports:', error);
    }
};

// Export the function to be used elsewhere
module.exports = trackFlightPrice;
