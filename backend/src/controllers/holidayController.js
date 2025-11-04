const HolidayService = require("../services/holidayService");

class HolidayController {
    static async createHoliday(req, res) {
        try {
            const { date, title } = req.body;
            if (!date || !title) {
                return res
                    .status(400)
                    .json({ error: 400, message: "Both date and title are required" });
            }
            const holiday = await HolidayService.createHoliday({ date, title });
            return res.status(201).json({
                success: true,
                message: "Holiday created successfully",
                holiday,
            });
        } catch (err) {
            return res.status(500).json({ error: 500, message: err.message });
        }
    }
    static async getHoliday(req, res) {
        try {
            const currentYear = new Date().getFullYear();

            const holidays = await HolidayService.getHolidaysByYear(currentYear);

            return res.status(200).json(holidays);
        } catch (err) {
            return res.status(500).json({ error: 500, message: err.message });
        }
    }
    static async updateHoliday(req, res) {
        try {
            const { id, date, title } = req.body;

            if (!id) {
                return res
                    .status(400)
                    .json({ error: 400, message: "Holiday ID is required" });
            }
            const updatedHoliday = await HolidayService.updateHoliday({
                id,
                date,
                title,
            });
            return res.status(200).json({
                success: true,
                message: "Holiday updated successfully",
                holiday: updatedHoliday,
            });
        } catch (err) {
            return res.status(500).json({ error: 500, message: err.message });
        }
    }
    static async deleteHoliday(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res
                    .status(400)
                    .json({ error: 400, message: "Holiday ID not provided" });
            }

            const deleted = await HolidayService.deleteHoliday(id);

            if (!deleted) {
                return res
                    .status(404)
                    .json({ error: 404, message: "Holiday not found" });
            }

            return res
                .status(200)
                .json({ success: true, message: "Holiday deleted successfully" });
        } catch (err) {
            return res.status(500).json({ error: 500, message: err.message });
        }
    }
}

module.exports = HolidayController;
