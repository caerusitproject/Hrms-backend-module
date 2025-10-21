const nodemailer = require('nodemailer');
const { leaveNotificationConsumer } = require('../notificationService');

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

  try {
    const compiled = await leaveNotificationConsumer(payload);
    if (!compiled) {
      console.warn("⚠️ No compiled email data returned.");
      return;
    }

    // Send email using the compiled template
    await transporter.sendMail({
      from: '"HRMS Notification" <no-reply@hrms.com>',
      to: compiled.toEmail || email,
      subject: compiled.subject || subject || "Notification",
      html: compiled.body,
    });

    console.log(`✅ Email sent to ${compiled.toEmail || email}`);
  } catch (err) {
    console.error(`❌ Failed to send email notification:`, err.message);
  }
};

exports.sendPayslipEmail = async (to, filePath) => {
    await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: 'Your Monthly Payslip',
    html: '<h3> <p>Please find your payslip attached.</p></h3>',
    attachments: [{ filename: filePath.split('/').pop(), content: fs.createReadStream(filePath) }]
  });
};