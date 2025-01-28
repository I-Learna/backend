const nodemailer = require("nodemailer");
const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "ahmed.nassar855@gmail.com",
            pass: "smldiycrpenhhmdw",
        },
    });
    const info = await transporter.sendMail({
        from: '"foo" <ahmed.nassar855@gmail.com>',
        to: options.email,
        subject: "Hello ✔",
        html: options.template,
    });
    console.log('Message sent: %s', info.messageId);

};


module.exports = sendEmail;
