const fs = require("fs");
const transporter = require("../../config/emailTransporter");
const { emailTemplateGetter } = require("../services/notification/emailTemplateGetter");

const sendPayslipEmail = async (employee, filePath) => {
  const payload = {
    ...employee,
    type: "payslip",
    attachmentFilePath: filePath,
  };
  const compiled = await emailTemplateGetter(payload);
  if (!compiled) {
    console.warn("⚠️ No compiled email data returned.");
    return;
  }
  let attachments = compiled.attachments || [];

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: employee.email,
    subject: compiled.subject || "Your Monthly Payslip",
    html: compiled.body,
    attachments
  });
};

module.exports = sendPayslipEmail;