const nodemailer = require ("nodemailer"); 
require ("dotenv").config();

console.log(process.env.hellyahoo)

console.log(process.env.APP_PASSWORD_YAHOO)

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
let from_airport='',to_airport='',flight_date='',cheapest_price='',savings_cheapest='',best_price='',savings_best='',cheapest_flight_link='',best_flight_link='';
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
      color: #32de84; /* Softer green for "You Save" */
      margin: 15px 0;
      background-color: #32de84; /* Light green background */
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
    <h3>For your Flight from Bengaluru to Dubai, on 5th December,2024</h3>

        <!-- Best Flight Option -->
        <div class="option">
          <h3 class="savings">🎉 You Save: ₹${savings_best} with our Best price of: ₹${best_price}</h1>
          <a href="${best_flight_link}" class="book-button">Book Now</a>
        </div>
        <div class="option-container">
        <!-- Cheapest Flight Option -->
        <div class="option">
          <h3 class="savings">🎉 You Save: ₹${savings_cheapest} with our Cheapest price of: ₹${cheapest_price}</h1>
          <a href="${cheapest_flight_link}" class="book-button">Book Now</a>
        </div>
      </div>
      <p style="margin-top: 20px; font-size: 14px; color: #777;">Hurry! We are holding these prices for you.</p>
    </div>
    <div class="foter">
      <p>Powered by FareScouter | Never miss a Deal. Happy traveling!</p>
    </div>
  </div>
</body>
</html>
 `,
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