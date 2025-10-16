const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER, // your SMTP email
    pass: process.env.SMTP_PASS, // your SMTP password or app password
  },
});

exports.sendEmail = async (to, subject, payload) => {
  const html = `
    <h3>Welcome ${payload.name}!</h3>
    <p>Your registration is successful.</p>
    <p>Department: ${payload.department}</p>
    <br>
    <p>Thanks, HRMS Team</p>
  `;

  const mailOptions = {
    from: `"HRMS Notification" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error('❌ Email send failed:', err);
  }
};