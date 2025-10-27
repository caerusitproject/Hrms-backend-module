const emailService = require('../util/emailService');

const sendMail = async (req, res) => {
    const { subject, body } = req.body;
    if (!subject || subject.trim() === '') {return res.status(400).json({ message: 'Email subject is required' });}
    if (!body || body.trim() === '') {return res.status(400).json({ message: 'Email body is required' });}
    try {
        await emailService.sendEmail(req.body);
        res.status(201).json({ message: ' Email sent successfully' });
    } catch (error) {
        console.error('Error Sending mail', error);
        res.status(500).json({ error: 500, message: error.message });
    }
};

module.exports = { sendMail };