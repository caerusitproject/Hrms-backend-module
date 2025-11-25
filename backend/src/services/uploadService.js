const db = require("../models");
const Upload = db.Upload;
const Employee = db.Employee;
const Document = require("../models/Document");
const fs = require("fs");
const path = require("path");

class UploadService {
  /**
   * Save uploaded file metadata in DB
   * @param {Object} payload - employee_id, file_path, file_type
   * @returns {Promise<Object>}
   */
  static async saveFile(payload) {
    const transaction = await Upload.sequelize.transaction();
    try {
      const employee = await Employee.findByPk(payload.employee_id);
      if (!employee) throw new Error("Employee not found");

      const fileName = await this.normalizePhotoPath(payload.file_path);
      let upload;
      if (employee.imageId) {
        upload = await Upload.findByPk(employee.imageId, { transaction });
        if (upload) {
          await upload.update(
            { file_path: fileName, file_type: payload.file_type },
            { transaction }
          );
        } else {
          upload = await Upload.create(
            { employee_id: payload.employee_id, file_path: fileName, file_type: payload.file_type },
            { transaction }
          );

          await employee.update({ imageId: upload.id }, { transaction });
        }
      } else {
        logger.info(`Creating new upload for employee ID: ${payload.employee_id}`);
        upload = await Upload.create(
          { employee_id: payload.employee_id, file_path: fileName, file_type: payload.file_type },
          { transaction }
        );
        logger.info(`Created new upload with ID: ${upload.id} for employee ID: ${payload.employee_id}`);
        
        await employee.update({ imageId: upload.id }, { transaction });
      }

      await transaction.commit();
      return upload;
    } catch (err) {
      logger.error('❌ Failed to save file upload', err);
      await transaction.rollback();
        logger.info(`Rolled back transaction for employee ID: ${payload.employee_id}`);
      throw err;
    }
  }

  static async saveDocFile(payload) {
    logger.info(`Saving document for employee ID: ${payload.employee_id}`);
    try {
      if (!payload.employee_id) throw new Error("Employee ID is required");
      if (!payload.file_path) throw new Error("File path is required");
      if (!payload.file_type) throw new Error("File type is required");
      if (!payload.type) throw new Error("Document type is required");
      if (!payload.title) throw new Error("Document title is required");
      if (!payload.uploadedBy) throw new Error("UploadedBy is required");

      const employee = await Employee.findByPk(payload.employee_id);
      if (!employee) throw new Error("Employee not found");

      const fileName = payload.file_path.split('\\').pop().split('/').pop();

      const document = await Document.create({
        employee_id: payload.employee_id,
        title: payload.title,
        content: payload.content || null,
        type: payload.type,
        file_path: fileName,
        file_type: payload.file_type,
        uploadedBy: payload.uploadedBy,
      });
      logger.info(`Document saved with ID: ${document.id} for employee ID: ${payload.employee_id}`);
      return document;
    } catch (err) {
      logger.error('❌ Failed to save document', err);
      throw err;
    }
  }



  /**
   * Get all files for an employee
   * @param {Number} employee_id
   * @returns {Promise<Array>}
   */
  static async getFilesByEmployee(employee_id) {
    logger.info(`Fetching files for employee ID: ${employee_id}`);
    const emp = await Employee.findByPk(employee_id);
    if (!emp) throw new Error("Employee Does Not Exist!");

    const upload = await Upload.findOne({ employee_id : employee_id });

    if (!upload || upload.length === 0) return { message: "NO RECORD FOUND AGAINST THE EMPLOYEE!", upload: [] };
    logger.info(`Found ${upload.length} files for employee ID: ${employee_id}`);
    const normalizedUploads = {...upload.dataValues, file_path: await this.normalizePhotoPath(upload.file_path) };
    const fileName  =upload.file_path
    const imagePath = path.join(__dirname, "..", "uploads", fileName);

    return fileName;
  }

  static async getDocByEmployee(employee_id) {
    logger.info(`Fetching documents for employee ID: ${employee_id}`);
    const emp = await Employee.findByPk(employee_id);
    if (!emp) throw new Error("Employee Does Not Exist!");
    logger.info(`Employee exists with ID: ${employee_id}`);
    const upload = await Document.findAll({
      where: { employee_id },
      attributes: ['id', 'title', 'content', 'file_type', 'type', 'file_path','uploadedBy'],
      order: [["uploaded_at", "DESC"]],
    });
      logger.info(`Found ${upload.length} documents for employee ID: ${employee_id}`);
    if (!upload || upload.length === 0) return { message: "NO RECORD FOUND AGAINST THE EMPLOYEE!", upload: [] };
    return upload;
  }




  /**
   * Delete a file by ID
   * @param {Number} id
   * @returns {Promise<Boolean>}
   */
  static async deleteFile(id) {
    try {
      logger.info(`Deleting document with ID: ${id}`);
      const deleted = await Document.destroy({ where: { id } });
      return deleted ;
    } catch (error) {
      logger.error(`❌ Failed to delete document with ID: ${id}`, error);
      throw error;
    }
  }

  static async deleteImage(fileId) {
    const transaction = await Upload.sequelize.transaction();
    logger.info(`Starting transaction to delete image with ID: ${fileId}`);
    try {
      const upload = await Upload.findByPk(fileId, { transaction });
      if (!upload) throw new Error("File not found");

      const employee = await Employee.findByPk(upload.employee_id, { transaction });
      if (employee && employee.imageId === upload.id) {
        await employee.update({ imageId: null }, { transaction });
      }

      await upload.destroy({ transaction });
      await transaction.commit();
      logger.info(`Successfully deleted image with ID: ${fileId}`);
      return true;
    } catch (err) {
      logger.error(`❌ Failed to delete image with ID: ${fileId}`, err);
      await transaction.rollback();
      logger.info(`Rolled back transaction for image ID: ${fileId}`);
      throw err;
    }
  }

  static async normalizePhotoPath(photoPath) {
  if (!photoPath) return null;

  // If it already starts with /uploads return it
  if (photoPath.startsWith("/")) return photoPath;

  // Convert Windows path → filename → URL
  const filename = photoPath.split("\\").pop();
  return `uploads/${filename}`;
}




}
module.exports = UploadService;