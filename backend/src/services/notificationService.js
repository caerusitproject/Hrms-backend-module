/*const { consumer } = require("../config/kafka");
const transporter = require("../config/mail");
const startLeaveNotificationConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "leave-events", fromBeginning: false });
  console.log("✅ Kafka Leave Notification Consumer Started");

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());
      console.log("📨 Event Received:", event.eventType);

      let mailOptions;

      if (event.eventType === "LEAVE_APPLIED") {
        mailOptions = {
          from: process.env.SMTP_EMAIL,
          to: event.manager.email,
          subject: "Leave Application Received",
          html: `
            <h3>Hi ${event.manager.name},</h3>
            <p>${event.employee.name} has applied for leave from <b>${event.startDate}</b> to <b>${event.endDate}</b>.</p>
            <p>Reason: ${event.reason}</p>
          `,
        };
      } else if (event.eventType === "LEAVE_APPROVED") {
        mailOptions = {
          from: process.env.SMTP_EMAIL,
          to: event.employee.email,
          subject: "Leave Approved",
          html: `
            <h3>Hi ${event.employee.name},</h3>
            <p>Your leave from <b>${event.startDate}</b> to <b>${event.endDate}</b> has been <b>approved</b> by ${event.manager.name}.</p>
          `,
        };
      } else if (event.eventType === "LEAVE_REJECTED") {
        mailOptions = {
          from: process.env.SMTP_EMAIL,
          to: event.employee.email,
          subject: "Leave Rejected",
          html: `
            <h3>Hi ${event.employee.name},</h3>
            <p>Your leave from <b>${event.startDate}</b> to <b>${event.endDate}</b> has been <b>rejected</b> by ${event.manager.name}.</p>
          `,
        };
      }

      if (mailOptions) {
        try {
          await transporter.sendMail(mailOptions);
          console.log(`📧 Email sent successfully for ${event.eventType}`);
        } catch (err) {
          console.error("❌ Email send failed:", err.message);
        }
      }
    },
  });
}

module.exports = startLeaveNotificationConsumer;*///Sir's code earlier version


/*const { consumer } = require("../config/kafka");
const transporter = require("../config/mail");
const startLeaveNotificationConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "leave-events", fromBeginning: false });
  console.log("✅ Kafka Leave Notification Consumer Started");

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value.toString());
      console.log("📨 Event Received:", event.eventType);

      let mailOptions;

      if (event.eventType === "LEAVE_APPLIED") {
        mailOptions = {
          from: process.env.SMTP_EMAIL,
          to: event.manager.email,
          subject: "Leave Application Received",
          html: `
            <h3>Hi ${event.manager.name},</h3>
            <p>${event.employee.name} has applied for leave from <b>${event.startDate}</b> to <b>${event.endDate}</b>.</p>
            <p>Reason: ${event.reason}</p>
          `,
        };
      } else if (event.eventType === "LEAVE_APPROVED") {
        mailOptions = {
          from: process.env.SMTP_EMAIL,
          to: event.employee.email,
          subject: "Leave Approved",
          html: `
            <h3>Hi ${event.employee.name},</h3>
            <p>Your leave from <b>${event.startDate}</b> to <b>${event.endDate}</b> has been <b>approved</b> by ${event.manager.name}.</p>
          `,
        };
      } else if (event.eventType === "LEAVE_REJECTED") {
        mailOptions = {
          from: process.env.SMTP_EMAIL,
          to: event.employee.email,
          subject: "Leave Rejected",
          html: `
            <h3>Hi ${event.employee.name},</h3>
            <p>Your leave from <b>${event.startDate}</b> to <b>${event.endDate}</b> has been <b>rejected</b> by ${event.manager.name}.</p>
          `,
        };
      }

      if (mailOptions) {
        try {
          await transporter.sendMail(mailOptions);
          console.log(`📧 Email sent successfully for ${event.eventType}`);
        } catch (err) {
          console.error("❌ Email send failed:", err.message);
        }
      }
    },
  });
}

module.exports = startLeaveNotificationConsumer;*/


const EmailTemplate = require("../models/EmailTemplate");
const Handlebars = require("handlebars");

exports.leaveNotificationConsumer = async (payload) => {
  try {
    // Find email template by event type
    const template = await EmailTemplate.findOne({
      where: { type: payload.type },
    });

    if (!template) {
      console.warn(`⚠️ No email template found for event type: ${payload.type}`);
      return null;
    }

    // Prepare data for Handlebars
    const templateData = {
      name: payload.name,
      empCode: payload.empCode,
      email: payload.email,
      managerName: payload.manager?.name,
      startDate: payload.startDate,
      endDate: payload.endDate,
      reason: payload.reason,
    };

    // Keep only allowed variables
    const filteredData = {};
    if (Array.isArray(template.allowedVariables)) {
      template.allowedVariables.forEach((key) => {
        if (templateData[key] !== undefined) filteredData[key] = templateData[key];
      });
    }

    // Compile subject and body
    const compiledSubject = Handlebars.compile(template.subject)(filteredData);
    const compiledBody = Handlebars.compile(template.body)(filteredData);

    // Choose recipient
    let toEmail = payload.email;
    if (payload.eventType === "leave_applied") {
      toEmail = payload.manager?.email;
    }

    // Return compiled data (no sending here)
    return {
      toEmail,
      subject: compiledSubject,
      body: compiledBody,
    };
  } catch (err) {
    console.error("❌ Error processing leave notification:", err.message);
    throw err;
  }
};