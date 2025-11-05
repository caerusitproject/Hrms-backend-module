const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { Op, where, literal, Sequelize } = require('sequelize');

class CsvService {
  /**
   * Parse and import CSV file to database
   * @param {string} filePath - Path to the CSV file
   * @returns {Promise<Object>} - Import results
   */
  static async importCsvToDatabase(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error('CSV file not found');
      }

      const csvData = fs.readFileSync(filePath, 'utf8');

      const parseResult = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false, // keep everything as string
        transform: (value) => (typeof value === 'string' ? value.trim() : value),
      });

      if (parseResult.errors.length > 0) {
        throw new Error(`CSV parsing errors: ${JSON.stringify(parseResult.errors)}`);
      }

      const records = parseResult.data;
      if (records.length === 0) {
        throw new Error('No data found in CSV file');
      }

      const requiredFields = ['empCode', 'date', 'status'];
      const csvHeaders = Object.keys(records[0]);
      const missingFields = requiredFields.filter((f) => !csvHeaders.includes(f));
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const validRecords = [];
      const errors = [];

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        try {
          const attendanceRecord = await this.validateAndTransformRecord(record, i + 2);

          // --- Calculate timeSpent ---
          if (attendanceRecord.checkIn && attendanceRecord.checkOut) {
            const checkinTime = new Date(`1970-01-01T${attendanceRecord.checkIn}Z`);
            const checkoutTime = new Date(`1970-01-01T${attendanceRecord.checkOut}Z`);
            const diffMs = checkoutTime - checkinTime;

            if (diffMs < 0) {
              attendanceRecord.timeSpent = '00:00:00';
            } else {
              const totalSeconds = Math.floor(diffMs / 1000);
              const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
              const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
              const seconds = String(totalSeconds % 60).padStart(2, '0');
              attendanceRecord.timeSpent = `${hours}:${minutes}:${seconds}`;
            }
          } else {
            attendanceRecord.timeSpent = '00:00:00';
          }

          validRecords.push(attendanceRecord);
        } catch (err) {
          errors.push(`Row ${i + 2}: ${err.message}`);
        }
      }

      if (errors.length > 0 && validRecords.length === 0) {
        throw new Error(`All records invalid:\n${errors.join('\n')}`);
      }

      const insertedRecords = await Attendance.bulkCreate(validRecords, {
        updateOnDuplicate: ['checkin', 'checkout', 'status', 'timeSpent', 'updatedAt'],
        returning: true,
      });

      return {
        success: true,
        totalRecords: records.length,
        insertedRecords: insertedRecords.length,
        skippedRecords: records.length - validRecords.length,
        errors: errors.length > 0 ? errors : null,
        data: insertedRecords,
      };
    } catch (error) {
      throw error;
    }
  }

  static async validateAndTransformRecord(record, rowNumber) {
    const { empCode, date, checkin, checkout, status } = record;

    if (!empCode || !date || !status) {
      throw new Error('Missing required fields: empid, date, or status');
    }

    // Lookup Employee by empid
    const employee = await Employee.findOne({ where: { empCode } });
    if (!employee) {
      throw new Error(`Employee not found for empid: ${empCode}`);
    }

    // Validate date format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }

    // Validate time format HH:MM or HH:MM:SS
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    if (checkin && !timeRegex.test(checkin)) {
      throw new Error('Invalid checkin time format. Expected HH:MM or HH:MM:SS');
    }
    if (checkout && !timeRegex.test(checkout)) {
      throw new Error('Invalid checkout time format. Expected HH:MM or HH:MM:SS');
    }

    // Validate status
    const validStatuses = ['Present', 'Absent', 'Late', 'Half Day'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Expected one of: ${validStatuses.join(', ')}`);
    }

    return {
      empCode: empCode.toString(),
      date,
      checkIn: checkin || null,
      checkOut: checkout || null,
      status,
    };
  }
  static async getAttendanceRecords(month, year) {
    const attendORG= Attendance.findAll({
      where: {
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM date')),
            month
          ),
          Sequelize.where(
            Sequelize.fn('EXTRACT', Sequelize.literal('YEAR FROM date')),
            year
          )
        ]
      },
      attributes: ['empCode', 'date', 'checkIn', 'checkOut', 'timeSpent'],
      order: [['date', 'DESC'], ['empCode', 'ASC']]
    });
    return attendORG;
  }

  static async getAttendanceByEmployeeId(empCode, month, year) {
    try {
      // Default to current year if not provided
      const selectedYear = year || new Date().getFullYear();
      const emp = await Employee.findOne({
        where: {
          empCode: empCode
        }
      });

      if (!emp) throw new Error("Employee does not exist with this employee Code");
      const records = await Attendance.findAll({
        where: {
          empCode,
          [Op.and]: [
            // PostgreSQL EXTRACT for month and year
            where(
              literal(`EXTRACT(MONTH FROM "date"::date)`),
              month
            ),
            where(
              literal(`EXTRACT(YEAR FROM "date"::date)`),
              selectedYear
            ),
          ],
        },
        order: [["date", "DESC"]],
      });

      return records;
    } catch (error) {
      console.error("Error fetching attendance:", error);
      throw error;
    }
  }
}

module.exports = CsvService;
