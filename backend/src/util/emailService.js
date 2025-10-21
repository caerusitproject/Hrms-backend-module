

const sendPayslipEmail = async (employee, filePath) => {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: employee.email,
    subject: 'Your Monthly Payslip',
    text: `Dear ${employee.name},\n\nYour payslip for this month is attached.\n\nRegards,\nHR Department`,
    attachments: [
      {
        filename: `${employee.name}_payslip.pdf`,
        path: filePath,
      },
    ],
  });
};

module.exports = sendPayslipEmail;