const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password',
  },
});

exports.sendEmailNotification = async (notification) => {
  const { email, subject, message } = notification;
  try {
    await transporter.sendMail({
      from: '"HRMS Notification" <no-reply@hrms.com>',
      to: email,
      subject,
      text: message,
    });

    console.log(`✅ Email sent to ${email}`);
  } catch (err) {
    console.error(`❌ Failed to send email to ${email}:`, err.message);
  }
};