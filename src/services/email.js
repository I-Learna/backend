const nodemailer = require('nodemailer');
const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });
  await transporter.sendMail({
    from: '"Ilearna Group" <ahmed.nassar855@gmail.com>',
    to: options.email,
    subject: options.subject,
    html: options.template,
  });
};

module.exports = sendEmail;
