const HandbookService = require("../services/handbookService");

class HandbookController {
  static async createHandbook(req, res) {
    try {
      const { title } = req.body;
      const file = req.file;
      if (!title || !file) {
        return res
          .status(400)
          .json({ error: 400, message: "Title and file are required" });
      }
      const handbook = await HandbookService.createHandbook({
        title,
        file,
        updatedBy: req.user.id,
      });
      return res.status(201).json({
        success: true,
        message: "Handbook entry created successfully",
        handbook,
      });
    } catch (err) {
      return res.status(500).json({ error: 500, message: err.message });
    }
  }
  static async getAllHandbooks(req, res) {
    try {
      const handbooks = await HandbookService.getAllHandbooks();
      return res.status(200).json(handbooks);
    } catch (err) {
      return res.status(500).json({ error: 500, message: err.message });
    }
  }
  static async getHandbookById(req, res) {
    try {
      const { id } = req.params;
      const handbook = await HandbookService.getHandbookById(id);
      if (!handbook) {
        return res
          .status(404)
          .json({ error: 404, message: "Handbook entry not found" });
      }
      return res.status(200).json(handbook);
    } catch (err) {
      return res.status(500).json({ error: 500, message: err.message });
    }
  }
  static async updateHandbook(req, res) {
    try {
      const { id } = req.params;
      const { title } = req.body;
      const file = req.file;
      const updatedHandbook = await HandbookService.updateHandbook({
        id,
        title,
        file,
        updatedBy: req.user.id,
      });
      if (!updatedHandbook) {
        return res
          .status(404)
          .json({ error: 404, message: "Handbook entry not found" });
      }
      return res.status(200).json({
        success: true,
        message: "Handbook entry updated successfully",
        handbook: updatedHandbook,
      });
    } catch (err) {
      return res.status(500).json({ error: 500, message: err.message });
    }
  }
  static async deleteHandbook(req, res) {
    try {
      const { id } = req.params;
      const deleted = await HandbookService.deleteHandbook(id);
      if (!deleted) {
        return res
          .status(404)
          .json({ error: 404, message: "Handbook entry not found" });
      }
      return res
        .status(200)
        .json({
          success: true,
          message: "Handbook entry deleted successfully",
        });
    } catch (err) {
      return res.status(500).json({ error: 500, message: err.message });
    }
  }
}
module.exports = HandbookController;
