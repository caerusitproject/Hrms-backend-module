const Holiday = require("../models/holiday");
const { Op } = require("sequelize");

class HolidayService {
  static async createHoliday(payload) {
    try {
      if (!payload.date) throw new Error("Holiday date is required");
      if (!payload.title) throw new Error("Holiday title is required");

      const holiday = await Holiday.create({
        date: payload.date,
        title: payload.title,
      });

      return holiday;
    } catch (err) {
        throw err;
    }
  }

  static async getHolidaysByYear(year) {
  try {
    if (!year) throw new Error("Year is required");

    const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${year}-12-31`);

    const holidays = await Holiday.findAll({
      where: {
        date: {
           [Op.between]: [startOfYear, endOfYear],
        },
      },
      attributes:['id','date','title'],
      order: [["date", "ASC"]],
    });

    // if (!holidays || holidays.length === 0)
    //   return { message: "No holidays found for this year", holidays: [] };

    return holidays;
  } catch (err) {
    
      throw err;
  }
}
  static async updateHoliday(payload) {
    try {
      if (!payload.id) throw new Error("Holiday ID is required");

      const holiday = await Holiday.findByPk(payload.id);
      if (!holiday) throw new Error("Holiday not found");

      await holiday.update({
        date: payload.date || holiday.date,
        title: payload.title || holiday.title,
      });

      return holiday;
    } catch (err) {
      
      throw err;
    }
  }

  static async deleteHoliday(id) {
    try {
      if (!id) throw new Error("Holiday ID is required");

      const deleted = await Holiday.destroy({ where: { id } });
      return deleted;
    } catch (err) {
      
      throw err;
    }
  }
}

module.exports = HolidayService;
