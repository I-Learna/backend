const nodemailer = require("nodemailer");
const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASS,
        },
    });
    const info = await transporter.sendMail({
        from: '"Ilearna Group" <ahmed.nassar855@gmail.com>',
        to: options.email,
        subject: options.subject,
        html: options.template,
    });
    console.log('Message sent: %s', info.messageId);

};


module.exports = sendEmail;
