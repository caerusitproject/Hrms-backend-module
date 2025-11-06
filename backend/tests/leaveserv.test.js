const LeaveInfoService = require("../src/services/leaveInfoService");
const Leave = require("../src/models/LeaveRequest");
const Employee = require("../src/models/Employee");
const LeaveInfo = require("../src/models/LeaveInfo");

jest.mock("../src/models/LeaveRequest", () => ({}));
jest.mock("../src/models/Employee", () => ({
    findByPk: jest.fn(),
}));
jest.mock("../src/models/LeaveInfo", () => ({
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
}));

describe("Leave Info Service Tests", () => {
    beforeEach(() => jest.clearAllMocks());

    describe("addOrUpdateLeave", () => {
        it("should create a new leave info if not existing", async () => {
            const emp = { id: 1 };
            Employee.findByPk.mockResolvedValue(emp);
            LeaveInfo.findOne.mockResolvedValue(null);
            LeaveInfo.create.mockResolvedValue({ id: 10 });


            const result = await LeaveInfoService.addOrUpdateLeave(1, {
                earnedLeave: 10,
                casualLeave: 5,
                sickLeave: 3,
            });

            expect(Employee.findByPk).toHaveBeenCalledWith(1);
            expect(LeaveInfo.create).toHaveBeenCalled();
            expect(result.message).toBe("Leaves created successfully");
        });

        it("should update existing leave info if found", async () => {
            const emp = { id: 1 };
            const mockExisting = { id: 10, update: jest.fn().mockResolvedValue() };
            Employee.findByPk.mockResolvedValue(emp);
            LeaveInfo.findOne.mockResolvedValue(mockExisting);

            const result = await LeaveInfoService.addOrUpdateLeave(1, { earnedLeave: 15 });
            expect(mockExisting.update).toHaveBeenCalled();
            expect(result.message).toBe("Leave updated successfully");
        });

        it("should throw error if employee not found", async () => {
            Employee.findByPk.mockResolvedValue(null);
            await expect(LeaveInfoService.addOrUpdateLeave(1, {})).rejects.toThrow("Employee not found");
        });


    });

    describe("getAllLeaveInfo", () => {
        it("should return leave info with employee", async () => {
            const leaveList = [{ id: 1 }];
            LeaveInfo.findAll.mockResolvedValue(leaveList);
            const result = await LeaveInfoService.getAllLeaveInfo();
            expect(LeaveInfo.findAll).toHaveBeenCalled();
            expect(result).toEqual(leaveList);
        });


        it("should return message if no records found", async () => {
            LeaveInfo.findAll.mockResolvedValue([]);
            const result = await LeaveInfoService.getAllLeaveInfo();
            expect(result).toEqual({ message: "No leave info found", leaveInfo: [] });
        });


    });

    describe("getLeaveInfoByEmployee", () => {
        it("should return leave info for employee", async () => {
            const emp = { id: 1 };
            Employee.findByPk.mockResolvedValue(emp);
            LeaveInfo.findOne.mockResolvedValue({ id: 5 });
            const result = await LeaveInfoService.getLeaveInfoByEmployee(1);
            expect(Employee.findByPk).toHaveBeenCalledWith(1);
            expect(result).toEqual({ id: 5 });
        });


        it("should throw error if employee not found", async () => {
            Employee.findByPk.mockResolvedValue(null);
            await expect(LeaveInfoService.getLeaveInfoByEmployee(1)).rejects.toThrow("Employee not found");
        });


    });

    describe("deleteLeaveInfo", () => {
        it("should delete leave info successfully", async () => {
            LeaveInfo.destroy.mockResolvedValue(1);
            const result = await LeaveInfoService.deleteLeaveInfo(1);
            expect(LeaveInfo.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(result).toEqual({ message: "Leave info deleted successfully" });
        });


        it("should throw if record not found", async () => {
            LeaveInfo.destroy.mockResolvedValue(0);
            await expect(LeaveInfoService.deleteLeaveInfo(99)).rejects.toThrow("Leave info record not found");
        });


    });

});
