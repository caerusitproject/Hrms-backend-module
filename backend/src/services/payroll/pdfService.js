
const PDFDocument = require('pdfkit');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

async function generatePayslipPdf(lineItem, employee) {
   const path = `payslips/${employee.empCode}_${period}.pdf`;  
  const dir = path.join(__dirname, '..', '..', 'artifacts', 'payslips');
  fs.mkdirSync(dir, { recursive: true });
  const filename = `${lineItem.id}.pdf`;
  const filepath = path.join(dir, filename);

  const doc = new PDFDocument();
  const stream = fs.createWriteStream(filepath);
  doc.pipe(stream);

  doc.fontSize(18).text('Payslip', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Employee: ${employee.firstName} ${employee.lastName} (${employee.empCode || ''})`);
  doc.text(`Period: ${lineItem.runPeriod || ''}`);
  doc.moveDown();

  doc.text('Earnings:');
  Object.entries(lineItem.earnings || {}).forEach(([k, v]) => doc.text(`${k}: ${v}`));
  doc.moveDown();
  doc.text('Deductions:');
  Object.entries(lineItem.deductions || {}).forEach(([k, v]) => doc.text(`${k}: ${v}`));
  doc.moveDown();
  doc.text(`Gross: ${lineItem.gross}`);
  doc.text(`Taxes: ${lineItem.taxes}`);
  doc.text(`Net Pay: ${lineItem.netPay}`);

  doc.end();

  await new Promise((res, rej) => stream.on('finish', res).on('error', rej));

  const fileBuf = fs.readFileSync(filepath);
  const hash = crypto.createHash('sha256').update(fileBuf).digest('hex');

  return { filepath, hash };
}

module.exports = { generatePayslipPdf };