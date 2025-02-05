const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail', // Use Gmail service
    auth: {
        user: 'kkankariya007@gmail.com', // Your Gmail address
        pass: 'Password123*' // Your Gmail password or App Password
    },
    tls: {
        rejectUnauthorized: false // Ignore self-signed certificate errors
    }
});

// Set up email data
let mailOptions = {
    from: '"Sender Name" <kkankariya007@gmail.com>', // Sender address
    to: 'recipient@example.com', // List of recipients
    subject: 'Hello ✔', // Subject line
    text: 'Hello world?', // Plain text body
    html: '<b>Hello world?</b>' // HTML body
};


const url = 'https://www.google.com/travel/flights/search?tfs=CBwQAhopEgoyMDI0LTExLTA3ag0IAhIJL20vMDE1eTJxcgwIAxIIL20vMDljMTdAAUgBcAGCAQsI____________AZgBAg';
const wanted_price = 5000;

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the URL
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Wait for elements with the specified class to appear
    await page.waitForSelector('.YMlIz.FpEdX.jLMuyc span', { timeout: 10000 }).catch(() => {
        console.log('Element with class .YMlIz.FpEdX.jLMuyc not found');
    });

    // Get the price from the span element
    const price = await page.$eval('.YMlIz.FpEdX.jLMuyc span', el => el.innerText || el.textContent)
        .catch(() => {
            console.log('No price element found');
            return null;
        });

    // Function to convert price string to number
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
        console.log('Price Found:', price);
        console.log('Price as Number:', priceNumber);

        // Example comparison with wanted price
        if (priceNumber < wanted_price) {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log('Error occurred: ' + error.message);
                }
                console.log('Message sent: %s', info.messageId);
            });
        } else {
            console.log('Price is higher than or equal to the wanted price.');
        }
    }

    await browser.close();
})();
