const HolidayController = require("../src/controllers/holidayController");
const HolidayService = require("../src/services/holidayService");
const Holiday = require("../src/models/holiday");
const { Op } = require("sequelize");

jest.mock("../src/models/holiday", () => ({
create: jest.fn(),
findAll: jest.fn(),
findByPk: jest.fn(),
destroy: jest.fn(),
}));

describe("Holiday Service & Controller Tests", () => {
let req, res;

beforeEach(() => {
jest.clearAllMocks();
req = { body: {}, params: {} };
res = {
status: jest.fn().mockReturnThis(),
json: jest.fn(),
};
});

// -----------------------------------------------------
// SERVICE TESTS
// -----------------------------------------------------

describe("HolidayService", () => {
describe("createHoliday", () => {
it("should create holiday successfully", async () => {
const payload = { date: "2025-12-25", title: "Christmas" };
Holiday.create.mockResolvedValue(payload);


    const result = await HolidayService.createHoliday(payload);

    expect(Holiday.create).toHaveBeenCalledWith(payload);
    expect(result).toEqual(payload);
  });

  it("should throw error if title is missing", async () => {
    const payload = { date: "2025-01-01" };
    await expect(HolidayService.createHoliday(payload)).rejects.toThrow("Holiday title is required");
  });
});

describe("getHolidaysByYear", () => {
  it("should return holidays for given year", async () => {
    const holidays = [{ id: 1, title: "New Year", date: "2025-01-01" }];
    Holiday.findAll.mockResolvedValue(holidays);

    const result = await HolidayService.getHolidaysByYear(2025);

    expect(Holiday.findAll).toHaveBeenCalledWith({
      where: {
        date: {
          [Op.between]: [new Date("2025-01-01"), new Date("2025-12-31")],
        },
      },
      attributes: ["id", "date", "title"],
      order: [["date", "ASC"]],
    });
    expect(result).toEqual(holidays);
  });

  it("should throw error if year missing", async () => {
    await expect(HolidayService.getHolidaysByYear()).rejects.toThrow("Year is required");
  });
});

describe("updateHoliday", () => {
  it("should update holiday successfully", async () => {
    const mockHoliday = { id: 1, update: jest.fn().mockResolvedValue() };
    Holiday.findByPk.mockResolvedValue(mockHoliday);

    const payload = { id: 1, title: "Updated Holiday" };
    const result = await HolidayService.updateHoliday(payload);

    expect(Holiday.findByPk).toHaveBeenCalledWith(1);
    expect(mockHoliday.update).toHaveBeenCalledWith({ date: undefined, title: "Updated Holiday" });
    expect(result).toBe(mockHoliday);
  });

  it("should throw error if holiday not found", async () => {
    Holiday.findByPk.mockResolvedValue(null);
    await expect(HolidayService.updateHoliday({ id: 5 })).rejects.toThrow("Holiday not found");
  });
});

describe("deleteHoliday", () => {
  it("should delete a holiday successfully", async () => {
    Holiday.destroy.mockResolvedValue(1);
    const result = await HolidayService.deleteHoliday(1);
    expect(Holiday.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toBe(1);
  });

  it("should throw error if id missing", async () => {
    await expect(HolidayService.deleteHoliday()).rejects.toThrow("Holiday ID is required");
  });
});


});

// -----------------------------------------------------
// CONTROLLER TESTS (Service Mocked)
// -----------------------------------------------------

describe("HolidayController", () => {
beforeEach(() => {
jest.clearAllMocks();
});


describe("createHoliday", () => {
  it("should return 400 if missing fields", async () => {
    req.body = {};
    await HolidayController.createHoliday(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 400,
      message: "Both date and title are required",
    });
  });

  it("should create holiday successfully", async () => {
    req.body = { date: "2025-01-01", title: "New Year" };
    const mockHoliday = { id: 1, title: "New Year" };
    jest.spyOn(HolidayService, "createHoliday").mockResolvedValue(mockHoliday);

    await HolidayController.createHoliday(req, res);

    expect(HolidayService.createHoliday).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Holiday created successfully",
      holiday: mockHoliday,
    });
  });
});

describe("getHoliday", () => {
  it("should return holidays for current year", async () => {
    const mockHolidays = [{ id: 1, title: "New Year" }];
    jest.spyOn(HolidayService, "getHolidaysByYear").mockResolvedValue(mockHolidays);

    await HolidayController.getHoliday(req, res);

    expect(HolidayService.getHolidaysByYear).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockHolidays);
  });

  it("should handle error", async () => {
    jest.spyOn(HolidayService, "getHolidaysByYear").mockRejectedValue(new Error("DB Error"));
    await HolidayController.getHoliday(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 500, message: "DB Error" });
  });
});

describe("updateHoliday", () => {
  it("should return 400 if ID missing", async () => {
    req.body = { title: "No ID" };
    await HolidayController.updateHoliday(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 400, message: "Holiday ID is required" });
  });

  it("should update holiday successfully", async () => {
    req.body = { id: 1, title: "Updated" };
    const updated = { id: 1, title: "Updated" };
    jest.spyOn(HolidayService, "updateHoliday").mockResolvedValue(updated);

    await HolidayController.updateHoliday(req, res);

    expect(HolidayService.updateHoliday).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Holiday updated successfully",
      holiday: updated,
    });
  });
});

describe("deleteHoliday", () => {
  it("should return 400 if ID missing", async () => {
    req.params = {};
    await HolidayController.deleteHoliday(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 400, message: "Holiday ID not provided" });
  });

  it("should return 404 if not found", async () => {
    req.params.id = 5;
    jest.spyOn(HolidayService, "deleteHoliday").mockResolvedValue(0);
    await HolidayController.deleteHoliday(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 404, message: "Holiday not found" });
  });

  it("should delete successfully", async () => {
    req.params.id = 1;
    jest.spyOn(HolidayService, "deleteHoliday").mockResolvedValue(1);
    await HolidayController.deleteHoliday(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Holiday deleted successfully",
    });
  });
});


});
});
