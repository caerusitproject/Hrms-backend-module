const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_EMAIL || 'your-email@gmail.com',
    pass: process.env.SMTP_PASSWORD || 'your-app-password',
  },
});

exports.sendEmailNotification = async (notification) => {
  const { email, subject, payload } = notification;
  const html = `<h3> <p>Hi  ${payload.name}, </p><p> your email is ${email} </p> <P>Your account has been created successfully!</p></h3>`;
  try {
    await transporter.sendMail({
      from: '"HRMS Notification" <no-reply@hrms.com>',
      to: email,
      subject,
      html: html,
    });

    console.log(`✅ Email sent to ${email}`);
  } catch (err) {
    console.error(`❌ Failed to send email to ${email}:`, err.message);
  }
};