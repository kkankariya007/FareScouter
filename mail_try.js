const nodemailer = require ("nodemailer"); 
require ("dotenv"). config();

const path = require("path");

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({

    service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.USER,
        pass: process.env.APP_PASSWORD,
    },
});


const mailOptions = {
    from: {
        name: 'Web Wizard', 
        address: process.env.USER
    }, // sender address
    to: ["kkankariya007@gmail.com"], 
    subject: "Send email using nodemailer and gmail v",
    text: "Hello world?",
    html: "<b>Hello",
}



const sendMail = async(transporter,mailOptions) => {

    try{

        await transporter.sendMail(mailOptions)
        console.log("Email sent")

   }catch(error){
    console.log(error)
    }



}