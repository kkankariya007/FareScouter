const nodemailer = require ("nodemailer"); 
require ("dotenv").config();

console.log(process.env.hellyahoo)

console.log(process.env.APP_PASSWORD_YAHOO)

const path = require("path");

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({

    service: 'yahoo',
    host: "smtp.mail.yahoo.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.hellyahoo,
        pass: process.env.APP_PASSWORD_YAHOO,
    },
    logger: true,
    tls: {
    //     secure: false,
        ignoreTLS: true,
    //     rejectUnauthorized: false
    },
});


const mailOptions = {
    from: {
        name: 'Web Wizard', 
        address: process.env.hellyahoo,
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