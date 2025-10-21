const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generatePayslipPDF = async (employee, payroll) => {
  const filePath = path.join(__dirname, `../../payslips/${employee.id}_${payroll.id}.pdf`);
  const doc = new PDFDocument();

  // Ensure payslip directory exists
  if (!fs.existsSync(path.join(__dirname, '../../payslips'))) {
    fs.mkdirSync(path.join(__dirname, '../../payslips'));
  }

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(18).text('Company Payslip', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Employee Name: ${employee.name}`);
  doc.text(`Employee Email: ${employee.email}`);
  doc.text(`Payroll Month: ${payroll.month}`);
  doc.text(`Base Salary: ₹${payroll.baseSalary}`);
  doc.text(`Bonus: ₹${payroll.bonus}`);
  doc.text(`Deductions: ₹${payroll.deductions}`);
  doc.text(`Net Salary: ₹${payroll.netSalary}`);
  doc.moveDown();
  doc.text('Generated on: ' + new Date().toLocaleString());

  doc.end();

  return filePath;
};
