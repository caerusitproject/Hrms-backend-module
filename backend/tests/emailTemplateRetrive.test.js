// tests/emailTemplateGetter.test.js
const fs = require("fs");
const Handlebars = require("handlebars");
const EmailTemplate = require("../src/models/EmailTemplate");
const {emailTemplateGetter} = require("../src/services/notification/emailTemplateGetter"); // adjust path if needed

jest.mock("fs");
jest.mock("handlebars");
jest.mock("../src/models/EmailTemplate");

describe("emailTemplateGetter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return fallback email when no template found", async () => {
    const payload = {
      type: "unknown_type",
      email: "user@example.com",
      attachmentFilePath: "/path/to/file.pdf",
    };

    EmailTemplate.findOne.mockResolvedValue(null);

    const mockStream = {};
    fs.createReadStream.mockReturnValue(mockStream);

    const result = await emailTemplateGetter(payload);

    expect(EmailTemplate.findOne).toHaveBeenCalledWith({
      where: { type: payload.type },
    });
    expect(fs.createReadStream).toHaveBeenCalledWith(payload.attachmentFilePath);

    expect(result).toEqual({
      toEmail: "user@example.com",
      subject: "<p>You have an email notification</p>",
      body: "<p>Sorry! No email template body is configured for this type of notification.</p>",
      attachments: [
        {
          filename: "file.pdf",
          content: mockStream,
        },
      ],
    });
  });

  it("should compile and return email using found template", async () => {
    const payload = {
      type: "welcome",
      name: "John",
      empCode: "EMP001",
      email: "john@example.com",
    };

    const mockTemplate = {
      subject: "Hello {{name}}",
      body: "Welcome {{name}}, your code is {{empCode}}",
      allowedVariables: ["name", "empCode"],
    };

    const compiledSubjectFn = jest.fn().mockReturnValue("Hello John");
    const compiledBodyFn = jest.fn().mockReturnValue("Welcome John, your code is EMP001");

    Handlebars.compile
      .mockImplementationOnce(() => compiledSubjectFn)
      .mockImplementationOnce(() => compiledBodyFn);

    EmailTemplate.findOne.mockResolvedValue(mockTemplate);

    const result = await emailTemplateGetter(payload);

    expect(EmailTemplate.findOne).toHaveBeenCalledWith({
      where: { type: payload.type },
    });
    expect(Handlebars.compile).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      toEmail: "john@example.com",
      subject: "Hello John",
      body: "Welcome John, your code is EMP001",
      attachments: [],
    });
  });

  it("should send email to manager when type is leave_applied", async () => {
    const payload = {
      type: "leave_applied",
      name: "Alice",
      empCode: "E002",
      email: "alice@example.com",
      manager: { name: "Bob", email: "bob@example.com" },
      startDate: "2025-11-01",
      endDate: "2025-11-05",
      reason: "Vacation",
    };

    const mockTemplate = {
      subject: "Leave Applied by {{name}}",
      body: "{{name}} applied leave from {{startDate}} to {{endDate}}",
      allowedVariables: ["name", "startDate", "endDate"],
    };

    const compiledSubjectFn = jest.fn().mockReturnValue("Leave Applied by Alice");
    const compiledBodyFn = jest.fn().mockReturnValue("Alice applied leave from 2025-11-01 to 2025-11-05");

    Handlebars.compile
      .mockImplementationOnce(() => compiledSubjectFn)
      .mockImplementationOnce(() => compiledBodyFn);

    EmailTemplate.findOne.mockResolvedValue(mockTemplate);

    const result = await emailTemplateGetter(payload);

    expect(result.toEmail).toBe("bob@example.com"); // manager email
    expect(result.subject).toBe("Leave Applied by Alice");
    expect(result.body).toBe("Alice applied leave from 2025-11-01 to 2025-11-05");
  });

  it("should attach file when attachmentFilePath is provided", async () => {
    const payload = {
      type: "welcome",
      name: "John",
      empCode: "E100",
      email: "john@example.com",
      attachmentFilePath: "/tmp/sample.txt",
    };

    const mockTemplate = {
      subject: "Hi {{name}}",
      body: "Your code is {{empCode}}",
      allowedVariables: ["name", "empCode"],
    };

    const compiledSubjectFn = jest.fn().mockReturnValue("Hi John");
    const compiledBodyFn = jest.fn().mockReturnValue("Your code is E100");

    fs.createReadStream.mockReturnValue("mockStream");
    Handlebars.compile
      .mockImplementationOnce(() => compiledSubjectFn)
      .mockImplementationOnce(() => compiledBodyFn);

    EmailTemplate.findOne.mockResolvedValue(mockTemplate);

    const result = await emailTemplateGetter(payload);

    expect(result.attachments).toEqual([
      { filename: "sample.txt", content: "mockStream" },
    ]);
  });

  it("should throw error if EmailTemplate.findOne fails", async () => {
    const payload = { type: "error_test", email: "test@example.com" };
    EmailTemplate.findOne.mockRejectedValue(new Error("DB error"));

    await expect(emailTemplateGetter(payload)).rejects.toThrow("DB error");
  });
});
