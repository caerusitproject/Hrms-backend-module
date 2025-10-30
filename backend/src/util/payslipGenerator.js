const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

function formatAmount(value) {
  return Number(value || 0).toFixed(2);
}

function formatCurrency(value) {
  const num = Number(value || 0);
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

exports.generatePayslip = async (employee, payroll) => {
  if (!employee) throw new Error('Employee not found');
  if (!payroll) throw new Error('Payroll not found');
  const payslipDir = path.join(__dirname, '../../payslips');
  if (!fs.existsSync(payslipDir)) fs.mkdirSync(payslipDir);
  const filePath = path.join(payslipDir, `Payslip_${employee.name}_${payroll.month}_${payroll.year}.pdf`);

  const doc = new PDFDocument({ margin: 0, size: 'A4' });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // Sky blue solid header
  const headerHeight = 100;
  doc.rect(0, 0, pageWidth, headerHeight).fill('#e619b2ff');
  doc.fillColor('#ffffff')
     .fontSize(26)
     .font('Helvetica-Bold')
     .text('CaerusItConsulting', 120, 30, { width: pageWidth - 320 });

  doc.fontSize(10)
     .font('Helvetica')
     .text('www.company.com | hr@company.com | +91 1234567890', 120, 58, { width: pageWidth - 320 });

  doc.rect(0, headerHeight, pageWidth, 3).fill('#e5e7eb');

  doc.fillOpacity(1);
  doc.fillColor('#000000');

  // Employee details card
  const cardStartY = headerHeight + 30;
  doc.roundedRect(40, cardStartY, pageWidth - 80, 100, 8)
     .fillAndStroke('#f9fafb', '#e5e7eb');

  const leftColX = 60;
  const rightColX = pageWidth / 2 + 20;

  doc.fontSize(9)
     .font('Helvetica')
     .fillColor('#6b7280')
     .text('Employee Name', leftColX, cardStartY + 20)
     .text('Employee ID', leftColX, cardStartY + 45)
     .text('Department', leftColX, cardStartY + 70)
     .text('Designation', rightColX, cardStartY + 20)
     .text('Pay Period', rightColX, cardStartY + 45)
     .text('Payment Date', rightColX, cardStartY + 70);

  doc.fontSize(11)
     .font('Helvetica-Bold')
     .fillColor('#111827')
     .text(employee.name || 'N/A', leftColX + 100, cardStartY + 20)
     .text(employee.empCode || 'N/A', leftColX + 100, cardStartY + 45)
     .text(employee.department || 'N/A', leftColX + 100, cardStartY + 70)
     .text(employee.designation || 'Manager', rightColX + 75, cardStartY + 20)
     .text(`${moment().month(payroll.month - 1).format('MMMM')} ${payroll.year}`, rightColX + 75, cardStartY + 45)
     .text(moment().format('DD MMM YYYY'), rightColX + 75, cardStartY + 70);

  // Earnings and Deductions section
  const tableStartY = cardStartY + 130;
  doc.rect(40, tableStartY, (pageWidth - 100) / 2, 35).fill('#d1fae5');
  doc.rect(40 + (pageWidth - 100) / 2 + 10, tableStartY, (pageWidth - 100) / 2, 35).fill('#fee2e2');

  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#047857')
     .text('Earnings', 60, tableStartY + 10);

  doc.fillColor('#dc2626')
     .text('Deductions', 60 + (pageWidth - 100) / 2 + 10, tableStartY + 10);

  const incomeFields = [
    ['Basic Salary', payroll.basicSalary || 0],
    ['HRA', payroll?.hra || 0],
    ['DA', payroll?.da || 0],
    ['Allowances', payroll?.allowances || 0],
    ['Bonus', payroll.bonus || 0],
    ['Incentives', payroll.incentives || 0],
    ['Overtime Pay', payroll.overtimePay || 0],
  ];

  const deductionFields = [
    ['Provident Fund', payroll.pf || 0],
    ['ESI', payroll.esi || 0],
    ['Professional Tax', payroll.professionalTax || 0],
    ['Income Tax (TDS)', payroll.incomeTax || 0],
    ['Gratuity', payroll.gratuity || 0],
    ['Other Deductions', payroll.deductions || 0],
  ];

  const leftColWidth = (pageWidth - 100) / 2;
  const rightColWidth = (pageWidth - 100) / 2;
  let rowY = tableStartY + 50;
  const maxRows = Math.max(incomeFields.length, deductionFields.length);

  doc.font('Helvetica').fontSize(10);

  for (let i = 0; i < maxRows; i++) {
    if (i % 2 === 0) {
      doc.rect(40, rowY - 5, leftColWidth, 22).fill('#f9fafb');
      doc.rect(40 + leftColWidth + 10, rowY - 5, rightColWidth, 22).fill('#f9fafb');
    }

    // Earnings
    if (incomeFields[i]) {
      const [label, value] = incomeFields[i];
      doc.fillColor('#374151').text(label, 60, rowY);
      doc.fillColor('#047857')
         .font('Helvetica-Bold')
         .text(`Rs. ${formatCurrency(value)}`, 60 + leftColWidth - 190, rowY, { width: 140, align: 'right' });
    }

    // Deductions
    if (deductionFields[i]) {
      const [label, value] = deductionFields[i];
      doc.fillColor('#374151')
         .font('Helvetica')
         .text(label, 60 + leftColWidth + 10, rowY);
      doc.fillColor('#dc2626')
         .font('Helvetica-Bold')
         .text(`Rs. ${formatCurrency(value)}`, 60 + leftColWidth + 10 + rightColWidth - 190, rowY, { width: 140, align: 'right' });
    }

    rowY += 25;
  }

  // Totals
  const totalsY = rowY + 10;
  doc.rect(40, totalsY, leftColWidth, 35).fillAndStroke('#047857', '#047857');
  doc.rect(40 + leftColWidth + 10, totalsY, rightColWidth, 35).fillAndStroke('#dc2626', '#dc2626');

  const grossSalary = payroll?.grossSalary || 0;
  const totalDeductions = payroll?.deductions || 0;

  doc.fillColor('#ffffff')
     .font('Helvetica-Bold')
     .fontSize(12)
     .text('Gross Earnings', 60, totalsY + 8)
     .text(`Rs. ${formatCurrency(grossSalary)}`, 60 + leftColWidth - 190, totalsY + 8, { width: 140, align: 'right' })
     .text('Total Deductions', 60 + leftColWidth + 10, totalsY + 8)
     .text(`Rs. ${formatCurrency(totalDeductions)}`, 60 + leftColWidth + 10 + rightColWidth - 190, totalsY + 8, { width: 140, align: 'right' });

  // Net Pay
  const netPayY = totalsY + 60;
  const netSalary = payroll?.netSalary ?? 0;
  doc.roundedRect(40, netPayY, pageWidth - 80, 60, 10)
     .fillAndStroke('#A8BF75', '#e619b2ff');

  doc.fillColor('#000000ff')
     .font('Helvetica-Bold')
     .fontSize(13)
     .text('NET PAY', 60, netPayY + 15)
     .font('Helvetica')
     .fontSize(10)
     .text('(Take Home Salary)', 60, netPayY + 33);

  doc.fillColor('#124019')
     .font('Helvetica-Bold')
     .fontSize(22)
     .text(`Rs. ${formatCurrency(netSalary)}`, pageWidth - 280, netPayY + 18, { width: 220, align: 'right' });

  // Footer
  const footerY = pageHeight - 80;
  doc.rect(0, footerY - 10, pageWidth, 1).fill('#d1d5db');

  doc.fillColor('#6b7280')
     .font('Helvetica')
     .fontSize(9)
     .text('This is a computer-generated document and does not require a physical signature.', 60, footerY, {
       width: pageWidth - 120,
       align: 'center'
     });

  doc.fontSize(8)
     .fillColor('#9ca3af')
     .text(`Generated on: ${moment().format('DD MMM YYYY, hh:mm A')}`, 60, footerY + 20, {
       width: pageWidth - 120,
       align: 'center'
     });

  // Page border
  doc.rect(20, 20, pageWidth - 40, pageHeight - 40)
     .strokeOpacity(0.08)
     .stroke('#A8BF75');

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
};