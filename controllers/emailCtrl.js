const nodemailer = require("nodemailer");
const asyncHandler=require('express-async-handler')


const sendEmail=asyncHandler(async(data,req,res)=>{
  const transporter = nodemailer.createTransport({
   service: 'gmail',
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.MAIL_ID,
      pass: process.env.MP,
    },
  })
   
  let info = await transporter.sendMail({
    from: `"Your Name" <${process.env.MAIL_ID}>`, // sender address
    to: data.to, // list of receivers
    subject: data.subject, // Subject line
    text: data.text, // plain text body
    html: data.htm, // html body
  });

  console.log("Message sent: %s", info.messageId);

  console.log("Preview URL: %s",nodemailer.getTestMessageUrl(info))

})
module.exports={sendEmail}