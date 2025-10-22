const EmailTemplate = require("../../models/EmailTemplate");
const Handlebars = require("handlebars");
const fs = require("fs");

exports.emailTemplateGetter = async (payload) => {
  try {
    const template = await EmailTemplate.findOne({
      where: { type: payload.type },
    });

    if (!template) {
      console.warn(`⚠️ No email template found for event type: ${payload.type}`);
      return null;
    }

    const templateData = {
      name: payload.name,
      empCode: payload.empCode,
      email: payload.email,
      managerName: payload.manager?.name,
      startDate: payload.startDate,
      endDate: payload.endDate,
      reason: payload.reason,
    };

    const filteredData = {};
    if (Array.isArray(template.allowedVariables)) {
      template.allowedVariables.forEach((key) => {
        if (templateData[key] !== undefined) filteredData[key] = templateData[key];
      });
    }

    const compiledSubject = Handlebars.compile(template.subject)(filteredData);
    const compiledBody = Handlebars.compile(template.body)(filteredData);

    let toEmail = payload.email;
    if (payload.type === "leave_applied") {
      toEmail = payload.manager?.email;
    }

    let attachments = [];
    if (payload.attachmentFilePath) {
      attachments.push({
        filename: payload.attachmentFilePath.split('/').pop(),
        content: fs.createReadStream(payload.attachmentFilePath),
      });
    }

    return {
      toEmail,
      subject: compiledSubject,
      body: compiledBody,
      attachments,
    };
  } catch (err) {
    console.error("❌ Error while getting the email template or processing the attachments :", err.message);
    throw err;
  }
};