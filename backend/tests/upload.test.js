const UploadService = require("../src/services/uploadService");
const uploadController = require("../src/controllers/uploadController");
const db = require("../src/models");
const Document = require("../src/models/Document");

jest.mock("../src/models", () => ({
  Upload: {
    sequelize: { transaction: jest.fn().mockResolvedValue({ commit: jest.fn(), rollback: jest.fn() }) },
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn(),
  },
  Employee: {
    findByPk: jest.fn(),
  },
}));
jest.mock("../src/models/Document", () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  destroy: jest.fn(),
}));

const { Upload, Employee } = db;

describe("Upload Service & Controller Tests", () => {
  let req, res;
  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, body: {}, file: null, user: { id: 1 } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  // ----------------- SERVICE TESTS -----------------
  describe("UploadService.saveFile", () => {
    it("should create a new upload record for employee", async () => {
      const trx = { commit: jest.fn(), rollback: jest.fn() };
      Upload.sequelize.transaction.mockResolvedValue(trx);
      const emp = { id: 1, imageId: null, update: jest.fn() };
      Employee.findByPk.mockResolvedValue(emp);
      Upload.create.mockResolvedValue({ id: 10 });


      const result = await UploadService.saveFile({
        employee_id: 1,
        file_path: "uploads/test.png",
        file_type: "image/png",
      });

      expect(Employee.findByPk).toHaveBeenCalledWith(1, { transaction: trx });
      expect(Upload.create).toHaveBeenCalled();
      expect(trx.commit).toHaveBeenCalled();
      expect(result).toEqual({ id: 10 });
    });

    it("should throw if employee not found", async () => {
      const trx = { commit: jest.fn(), rollback: jest.fn() };
      Upload.sequelize.transaction.mockResolvedValue(trx);
      Employee.findByPk.mockResolvedValue(null);
      await expect(
        UploadService.saveFile({ employee_id: 99, file_path: "x", file_type: "y" })
      ).rejects.toThrow("Employee not found");
      expect(trx.rollback).toHaveBeenCalled();
    });


  });

  describe("UploadService.saveDocFile", () => {
    it("should create document successfully", async () => {
      const emp = { id: 1 };
      Employee.findByPk.mockResolvedValue(emp);
      Document.create.mockResolvedValue({ id: 2 });
      const payload = {
        employee_id: 1,
        file_path: "uploads/doc.pdf",
        file_type: "application/pdf",
        type: "POLICY",
        title: "HR Policy",
        uploadedBy: 3,
      };
      const result = await UploadService.saveDocFile(payload);
      expect(Document.create).toHaveBeenCalled();
      expect(result).toEqual({ id: 2 });
    });


    it("should throw error if employee missing", async () => {
      await expect(
        UploadService.saveDocFile({ title: "x", type: "t", file_path: "p", file_type: "x", uploadedBy: 1 })
      ).rejects.toThrow("Employee ID is required");
    });


  });

  describe("getFilesByEmployee", () => {
    it("should return uploads for employee", async () => {
      const emp = { id: 1 };
      Employee.findByPk.mockResolvedValue(emp);
      Upload.findAll.mockResolvedValue([{ id: 1 }]);
      const result = await UploadService.getFilesByEmployee(1);
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe("deleteImage", () => {
    it("should delete employee image successfully", async () => {
      const trx = { commit: jest.fn(), rollback: jest.fn() };
      Upload.sequelize.transaction.mockResolvedValue(trx);
      const upload = { id: 2, employee_id: 1, destroy: jest.fn() };
      const emp = { imageId: 2, update: jest.fn() };
      Upload.findByPk.mockResolvedValue(upload);
      Employee.findByPk.mockResolvedValue(emp);


      const result = await UploadService.deleteImage(2);
      expect(upload.destroy).toHaveBeenCalled();
      expect(trx.commit).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should throw if file not found", async () => {
      const trx = { commit: jest.fn(), rollback: jest.fn() };
      Upload.sequelize.transaction.mockResolvedValue(trx);
      Upload.findByPk.mockResolvedValue(null);
      await expect(UploadService.deleteImage(1)).rejects.toThrow("File not found");
      expect(trx.rollback).toHaveBeenCalled();
    });


  });

  // ----------------- CONTROLLER TESTS -----------------
  describe("uploadController.uploadFile", () => {
    it("should return 400 if no file uploaded", async () => {
      req.params.id = 1;
      await uploadController.uploadFile(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 400, message: "No file uploaded" });
    });


    it("should upload file successfully", async () => {
      req.params.id = 1;
      req.file = { path: "uploads/test.png", mimetype: "image/png" };
      jest.spyOn(UploadService, "saveFile").mockResolvedValue({ id: 10 });
      await uploadController.uploadFile(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "File uploaded successfully",
        file: { id: 10 },
      });
    });


  });

  describe("uploadController.uploadDocument", () => {
    it("should return 400 if no id", async () => {
      await uploadController.uploadDocument(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });


    it("should upload document successfully", async () => {
      req.params.id = 1;
      req.file = { path: "uploads/file.pdf", mimetype: "application/pdf" };
      req.body = { title: "Doc", content: "C", type: "POLICY" };
      jest.spyOn(UploadService, "saveDocFile").mockResolvedValue({ id: 5 });
      await uploadController.uploadDocument(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Document uploaded successfully!",
        document: { id: 5 },
      });
    });


  });

  describe("getFiles & getDoc", () => {
    it("should return files", async () => {
      req.params.id = 1;
      jest.spyOn(UploadService, "getFilesByEmployee").mockResolvedValue([{ id: 1 }]);
      await uploadController.getFiles(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });


    it("should return docs", async () => {
      req.params.id = 1;
      jest.spyOn(UploadService, "getDocByEmployee").mockResolvedValue([{ id: 1 }]);
      await uploadController.getDoc(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });


  });

  describe("deleteImage & deleteFile", () => {
    it("should delete image successfully", async () => {
      req.params.fileId = 1;
      jest.spyOn(UploadService, "deleteImage").mockResolvedValue(true);
      await uploadController.deleteImage(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });


    it("should delete file successfully", async () => {
      req.params.fileId = 1;
      jest.spyOn(UploadService, "deleteFile").mockResolvedValue(1);
      await uploadController.deleteFile(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });


  });
});
