const bcrypt = require("bcryptjs");
const e = require("express");
const { Role, User, Employee, EmployeeRole, Department } = require("../models");


async function seedInitialData(db) {
  console.log("🔄 Checking initial HRMS bootstrap data…");

  // ⚡ 1. Check if roles already exist
  const existingRoles = await Role.count();
  const adminExists = await Employee.count();
  const userExists = await User.count();

  if (existingRoles > 0) {
    console.log("✔ Roles already initialized. Skipping bootstrap.");
    return;
  }

  const roles = await Role.bulkCreate([
    { name: "ADMIN_ROLE", role: 'ADMIN' },
    { name: "HR_ROLE", role: 'HR' },
    { name: "MANAGER_ROLE", role: 'MANAGER' },
    { name: "USER_ROLE", role: 'USER' }
  ]);
  console.log("⏳ Seeding default roles…");
  const adminRole = roles.find((r) => r.role === "ADMIN");

  console.log("✔ Default roles created.");

  // ⚡ 2. Create default admin employee
  if (!adminExists > 0) {
    console.log("⏳ Creating default admin employee…");

     const dept =await Department.create({
        
        departmentName: "Administration",
        description: "Handles all administrative tasks",
      });

    const adminEmployee = await Employee.create({
      name: "System Admin",
      email: "admin@company.com",
      password: await bcrypt.hash("Hello123", 10),
      phone: "9999999999",
      roleids: [adminRole.id],
      departmentId: dept.id,
      status: "ACTIVE"
    });

    const empRole = await EmployeeRole.create({
      employeeId: adminEmployee.id,
      roleId: adminRole.id
    });

    // ⚡ 3. Create login user for admin
    const hashedPass = await bcrypt.hash("Hello123", 10);
    if (!userExists > 0) {
      console.log("⏳ Creating default admin user account…");
      await User.create({
        username: "admin",
        email: "admin@company.com",
        password: hashedPass,
        roleId: adminRole.id
        
      });

      
     

      console.log("🎉 Department created:");
      console.log("🎉 Admin account created:");
      console.log("   Username: admin");
      console.log("   Password: Admin@123");
    } else {
      console.log("✔ Admin employee already exists. Skipping.");
    }

    console.log("🚀 HRMS bootstrap initialization complete.");
  }

}

module.exports = { seedInitialData };