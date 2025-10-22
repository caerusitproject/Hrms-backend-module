const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const moment = require('moment');


function formatAmount(value) {
  return Number(value || 0).toFixed(2);
}

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


exports.generatePayslip = async (employee, payroll) => {
  //const emp = await Employee.findByPk(employeeId);
  if (!employee) throw new Error('Employee not found');

  //const comp = await Compensation.findOne({ where: { id : employee.Id } });
  //if (!comp) throw new Error('Compensation not found');

  // File name & path
  const payslipDir = path.join(__dirname, '../../payslips');
  if (!fs.existsSync(payslipDir)) fs.mkdirSync(payslipDir);
  const filePath = path.join(payslipDir, `Payslip_${employee.name}_${payroll.month}_${payroll.year}.pdf`);

  const doc = new PDFDocument({ margin: 40 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Header
  doc
    .rect(0, 0, doc.page.width, 90)
    .fill('#1976D2')
    .fillColor('#fff')
    .fontSize(20)
    .text('Company Name Pvt. Ltd.', { align: 'center', underline: true })
    .fontSize(14)
    .text(`Payslip for ${moment().month(payroll.month - 1).format('MMMM')} ${payroll.year}`, { align: 'center' });

  doc.moveDown(2);
  doc.fillColor('#000');

  // Employee details section
  doc
    .fontSize(12)
    .text(`Employee Name: ${employee.name}`)
    .text(`Employee ID: ${employee.id}`)
    .text(`Department: ${employee.department || 'N/A'}`)
    .text(`Date: ${moment().format('DD-MM-YYYY')}`)
    .moveDown(1);

  // === Income & Deduction Table ===
  const incomeFields = [
    ['Basic Salary', payroll.basicSalary || 0] ,
    ['Bonus', payroll.bonus || 0],
    ['Incentives', payroll.incentives || 0],
    ['Overtime Pay', payroll.overtimePay || 0],
    //['Commission', payroll.commission || 0],
    ['Allowances', payroll?.allowances || 0],
    ['HRA', payroll?.hra],
    ['DA', payroll?.da],
   // ['LTA', payroll?.lta],
   // ['Medical Allowance', payroll.medicalAllowance],
  ];

  const deductionFields = [
    ['PF', payroll.pf],
    ['ESI', payroll.esi],
    ['Gratuity', payroll.gratuity],
    ['Professional Tax', payroll.professionalTax],
    ['Income Tax', payroll.incomeTax],
    ['Other Deductions', payroll.deductions],
  ];

  const startY = doc.y + 10;
  const grossSalary = payroll?.grossSalary || 0;
  const deductions = payroll?.deductions || 0;
  doc
    .fontSize(13)
    .fillColor('#1976D2')
    .text('Earnings', 80, startY)
    .text('Deductions', 350, startY);

  doc.moveDown(0.5);
  doc
    .strokeColor('#1976D2')
    .lineWidth(1)
    .moveTo(60, doc.y)
    .lineTo(550, doc.y)
    .stroke();

  doc.fillColor('#000').fontSize(11);
  const tableStartY = doc.y + 5;

  const maxRows = Math.max(incomeFields.length, deductionFields.length);
  let currentY = tableStartY;

  for (let i = 0; i < maxRows; i++) {
    if (incomeFields[i]) {
      const [label, value] =  incomeFields[i] || 0;
      doc.text(label, 80, currentY).text(value.toFixed(2), 200, currentY, { align: 'right' });
    }
    if (deductionFields[i]) {
      const [label, value] = deductionFields[i] || 0;
      doc.text(label, 350, currentY).text((value?? 0).toFixed(2), 500, currentY, { align: 'right' });
    }
    currentY += 20;
  }

  // Totals
  currentY += 10;
  doc
    .strokeColor('#1976D2')
    .moveTo(60, currentY)
    .lineTo(550, currentY)
    .stroke();

  doc
    .fontSize(12)
    .fillColor('#000')
    .text('Total Earnings:', 80, currentY + 10)
    .text(grossSalary.toFixed(2), 200, currentY + 10, { align: 'right' })
    .text('Total Deductions:', 350, currentY + 10)
    .text(deductions.toFixed(2), 500, currentY + 10, { align: 'right' });

  // Net Pay
  doc
    .rect(60, currentY + 40, 480, 40)
    .fill('#E3F2FD')
    .stroke()
    .fillColor('#000')
    .fontSize(14)
    .text(`Net Pay (₹): ${payroll?.netSalary.toFixed(2)}`, 80, currentY + 55);

  // Footer
  doc
    .fillColor('#555')
    .fontSize(10)
    .text('This is a computer-generated payslip and does not require a signature.', 60, doc.page.height - 50, {
      align: 'center'
    });

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
};

