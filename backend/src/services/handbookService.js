const Handbook = require("../models/Handbook");
const fs = require("fs");
const path = require("path");

class HandbookService {

  // ---------- NORMALIZE FILE PATH ----------
  static async normalizeFilePath(filePath) {
    if (!filePath) return null;

    // already normalized
    if (filePath.startsWith("/uploads")) return filePath;

    const filename = filePath.split("\\").pop(); // windows support
    return `/uploads/handbooks/${filename}`;
  }

  // ---------- CREATE NEW HANDBOOK ----------
  static async createHandbook(payload) {
    try {
      if (!payload.title) throw new Error("Title is required");
      if (!payload.file) throw new Error("File is required");

      const normalizedPath = await this.normalizeFilePath(payload.file.filename);

      const handbook = await Handbook.create({
        title: payload.title,
        contentUrl: normalizedPath,
        fileName: payload.file.originalname,
        mimeType: payload.file.mimetype,
        updatedBy: payload.updatedBy,
      });

      return handbook;
    } catch (err) {
      throw err;
    }
  }

  // ---------- GET ALL ----------
  static async getAllHandbooks() {
    try {
      return await Handbook.findAll({
        order: [["createdAt", "DESC"]],
      });
    } catch (err) {
      throw err;
    }
  }

  // ---------- GET SINGLE ----------
  static async getHandbookById(id) {
    try {
      return await Handbook.findByPk(id);
    } catch (err) {
      throw err;
    }
  }

  // ---------- UPDATE WITH FILE REPLACEMENT ----------
  static async updateHandbook(payload) {
    try {
      const handbook = await Handbook.findByPk(payload.id);
      if (!handbook) throw new Error("Handbook entry not found");

      let updateData = {
        title: payload.title ?? handbook.title,
        updatedBy: payload.updatedBy,
      };

      // Replace file if new uploaded
      if (payload.file) {
        // delete old file
        const existingFile = path.join(
          process.cwd(),
          handbook.contentUrl.replace("/", "")
        );

        if (fs.existsSync(existingFile)) {
          fs.unlinkSync(existingFile);
        }

        const normalizedPath = await this.normalizeFilePath(payload.file.filename);

        updateData.contentUrl = normalizedPath;
        updateData.fileName = payload.file.originalname;
        updateData.mimeType = payload.file.mimetype;
      }

      await handbook.update(updateData);
      return handbook;
    } catch (err) {
      throw err;
    }
  }

  // ---------- DELETE ----------
  static async deleteHandbook(id) {
    try {
      const handbook = await Handbook.findByPk(id);
      if (!handbook) return false;

      // delete file
      const filePath = path.join(
        process.cwd(),
        handbook.contentUrl.replace("/", "")
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await handbook.destroy();
      return true;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = HandbookService;
