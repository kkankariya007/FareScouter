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


const mailOptions = {
    from: {
        name: 'Web Wizard', 
        address: process.env.hell,
    }, // sender address
    to: ["kkankariya007@yahoo.com"], 
    subject: "Send email using nodemailer and gmail v",
    text: "Hello world?",
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