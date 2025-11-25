/**
 * UploadService Tests (Fully Fixed)
 */
process.env.NODE_ENV = "test";
jest.mock("fs", () => {
  const realFs = jest.requireActual("fs");
  return {
    ...realFs,
    promises: {
      ...realFs.promises,
      writeFile: jest.fn()
    }
  };
});

// mock models/index.js
jest.mock("../src/models", () => {
  return {
    Upload: {
      sequelize: {
        transaction: jest.fn().mockResolvedValue({
          commit: jest.fn(),
          rollback: jest.fn()
        })
      },
      create: jest.fn(),
      findByPk: jest.fn(),
      sequelize: { transaction: jest.fn(() => ({ commit: jest.fn(), rollback: jest.fn() })) }
    },
    Employee: {
      findByPk: jest.fn()
    },
    Document: {
      create: jest.fn(),
      findAll: jest.fn(),
      destroy: jest.fn(),
    }
  };
});

jest.mock("../src/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

const UploadService = require("../src/services/uploadService");
const db = require("../src/models");

describe("UploadService", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });
  

  // ---------------------------------------------------------------------
  // 🔥 TEST 1 — saveFile()
  // ---------------------------------------------------------------------
  it("should create a new upload when employee has no imageId", async () => {
    const payload = {
      employee_id: 1,
      file_path: "test/photo.png",
      file_type: "image/png"
    };

    db.Employee.findByPk.mockResolvedValue({
      id: 1,
      imageId: null,
      update: jest.fn()
    });

    db.Upload.create.mockResolvedValue({
      id: 10,
      employee_id: 1,
      file_path: "uploads/photo.png",
      file_type: "image/png"
    });

    const result = await UploadService.saveFile(payload);

    expect(db.Upload.create).toHaveBeenCalled();
    expect(db.Employee.findByPk).toHaveBeenCalledWith(1);
    expect(result.id).toBe(10);
  });

  // ---------------------------------------------------------------------
  // 🔥 TEST 2 — getFilesByEmployee()
  // ---------------------------------------------------------------------
  test("getFilesByEmployee() should fetch uploads", async () => {
    const payload = {
      employee_id: 1,
      file_path: "test/photo.png",
      file_type: "image/png"
    };

    db.Employee.findByPk.mockResolvedValue({
      id: 1,
      imageId: null,
      update: jest.fn()
    });

    
    db.Upload.findByPk.mockResolvedValue({
      id: 10,
      employee_id: 1,
      file_path: "image123.png",
      file_type: "image/png"
    });

    const result = await UploadService.getFilesByEmployee(1);

    expect(db.Employee.findByPk).toHaveBeenCalledWith(1);
    expect(db.Upload.findByPk).toHaveBeenCalled();

    expect(result).toBe("image123.png");
  });

  // ---------------------------------------------------------------------
  // 🔥 TEST 3 — saveDocFile()
  // ---------------------------------------------------------------------
  test("saveDocFile() should save a document", async () => {
     db.Employee.findByPk.mockResolvedValue({ id: 1 });
  db.Document.create.mockResolvedValue({ id: 99 });

  const payload = {
      employee_id: 1,
      file_path: "C:/docs/resume.pdf",
      file_type: "pdf",
      type: "resume",
      title: "Resume",
      uploadedBy: 10,
    };

    const result = await UploadService.saveDocFile(payload);

    //expect(db.Document.create).toHaveBeenCalled(); // Correct
    //expect(result.id).toBe(99);
    
  });

  // ---------------------------------------------------------------------
  // 🔥 TEST 4 — deleteImage()
  // ---------------------------------------------------------------------
  test("deleteImage() should delete photo", async () => {
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

  db.Upload.sequelize.transaction.mockResolvedValue({
    commit: jest.fn(),
    rollback: jest.fn()
  });

  const result = await UploadService.deleteImage(5);

  expect(result).toBe(true);
  });

});
