process.env.NODE_ENV = "test";

// ---------------------------
// MOCK LOGGER
// ---------------------------
jest.mock("../src/logger", () => ({
  info: jest.fn(),
  error: jest.fn()
}));

// ---------------------------
// MOCK MODELS (DB)
// ---------------------------
jest.mock("../src/models", () => ({
  Upload: {
    create: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    sequelize: {
      transaction: jest.fn(async () => ({
        commit: jest.fn(),
        rollback: jest.fn()
      }))
    }
  },
  Employee: {
    findByPk: jest.fn()
  },
  Document: {
    create: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn()
  }
}));

// ---------------------------
// MOCK DIRECT Document import
// because the service does:
// const Document = require("../models/Document");
// ---------------------------
jest.mock("../src/models/Document", () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  destroy: jest.fn()
}));

// Load mocks
const db = require("../src/models");
const Document = require("../src/models/Document");

// Service
const UploadService = require("../src/services/uploadService");

describe("UploadService Tests", () => {

  // ------------------------------------------------------------------
  test("saveDocFile() should save a document", async () => {
    db.Employee.findByPk.mockResolvedValue({ id: 1 });

    Document.create.mockResolvedValue({ id: 99 });

    const payload = {
      employee_id: 1,
      file_path: "C:/docs/resume.pdf",
      file_type: "pdf",
      type: "resume",
      title: "Resume Document",
      uploadedBy: 10
    };

    const result = await UploadService.saveDocFile(payload);

    expect(db.Employee.findByPk).toHaveBeenCalledWith(1);
    expect(Document.create).toHaveBeenCalled();
    expect(result.id).toBe(99);
  });

  // ------------------------------------------------------------------
  test("saveFile() should create new upload when employee has no previous image", async () => {
    db.Employee.findByPk.mockResolvedValue({
      id: 1,
      imageId: null,
      update: jest.fn()
    });

    db.Upload.create.mockResolvedValue({ id: 10 });
    db.Upload.sequelize.transaction.mockResolvedValue({
      commit: jest.fn(),
      rollback: jest.fn()
    });

    const payload = {
      employee_id: 1,
      file_path: "C:/photos/img1.png",
      file_type: "png"
    };

    const result = await UploadService.saveFile(payload);

    expect(db.Employee.findByPk).toHaveBeenCalledWith(1);
    expect(db.Upload.create).toHaveBeenCalled();
    expect(result.id).toBe(10);
  });

  // ------------------------------------------------------------------
  test("getFilesByEmployee() should return file name", async () => {
    db.Employee.findByPk.mockResolvedValue({ id: 1 });

    db.Upload.findByPk.mockResolvedValue({
      id: 5,
      file_path: "image123.png",
      dataValues: { file_path: "image123.png" }
    });

    const result = await UploadService.getFilesByEmployee(1);

    expect(db.Employee.findByPk).toHaveBeenCalledWith(1);
    expect(db.Upload.findByPk).toHaveBeenCalled();
    expect(result).toBe("image123.png");
  });

  // ------------------------------------------------------------------
  test("getDocByEmployee() should return list of documents", async () => {
    db.Employee.findByPk.mockResolvedValue({ id: 1 });

    Document.findAll.mockResolvedValue([
      { id: 1, title: "Resume" },
      { id: 2, title: "Offer Letter" }
    ]);

    const result = await UploadService.getDocByEmployee(1);

    expect(Document.findAll).toHaveBeenCalled();
    expect(result.length).toBe(2);
  });

  // ------------------------------------------------------------------
  test("deleteFile() should delete document", async () => {
    Document.destroy.mockResolvedValue(1);

    const result = await UploadService.deleteFile(5);

    expect(Document.destroy).toHaveBeenCalled();
    expect(result).toBe(1);
  });

  // ------------------------------------------------------------------
  test("deleteImage() should delete uploaded image", async () => {
    db.Upload.sequelize.transaction.mockResolvedValue({
      commit: jest.fn(),
      rollback: jest.fn()
    });

    db.Upload.findByPk.mockResolvedValue({
      id: 5,
      employee_id: 1,
      destroy: jest.fn()
    });

    db.Employee.findByPk.mockResolvedValue({
      id: 1,
      imageId: 5,
      update: jest.fn()
    });

    const result = await UploadService.deleteImage(5);

    expect(db.Upload.findByPk).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  // ------------------------------------------------------------------
  test("normalizePhotoPath() should return formatted path", async () => {
    const result = await UploadService.normalizePhotoPath("C:\\pics\\m.png");
    expect(result).toBe("uploads/m.png");
  });

});
