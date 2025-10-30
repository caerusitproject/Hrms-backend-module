require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./db');
const employeeRoutes = require("./routes/employeeRoutes");
const departmentRoutes = require('./routes/departmentRoutes');
const authRoutes = require('./routes/authRoute');
const roleRoutes = require("./routes/roleRoutes");
const leaveRoute = require("./routes/leaveRoutes");
const leaveInfoRoutes = require("./routes/leaveInfoRoutes");
const setupSwagger = require("./swagger");
const workflowRoute = require('./routes/workflowRouter');
const attendanceRoutes = require('./routes/attendanceRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const adminRoutes = require("./routes/admin/adminRoutes");
const managerRoutes = require("./routes/managerRoutes");
const broadcastRoutes = require("./routes/broadcastRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const hrRoutes = require('./routes/hrRoutes');
const emailTemplateRoutes = require('./routes/emailTemplateRoutes');
const compensationRoutes = require('./routes/payroll/compensationRoutes')
const payrollRoutes = require('./routes/payroll/payrollRoutes');
const app = express();
const cors = require('cors');
const path = require('path')
const PORT = process.env.PORT || 5000;

app.use(express.json());



// Swagger
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use('/api', routes);

// Admin-only routes
app.use("/api/admin", adminRoutes);
app.use("/api/leaveInfo", leaveInfoRoutes);
//Payroll
//app.use("/api/payroll/", payrollRouters);

app.use('/api/compensations', compensationRoutes);
app.use('/api/payrolls', payrollRoutes);

app.use("/api/auth", authRoutes);
//app.use(authenticate)
//app.use("/api/admin", adminRoutes);
app.use("/api/roles", roleRoutes);
// Routes
app.use("/api/employees", employeeRoutes);
//department

app.use('/api/departments', departmentRoutes);

//upload profile image and document 
app.use("/upload", uploadRoutes);
//Leave request
app.use("/api/leave", leaveRoute);

//workflow
app.use('/api/workflow', workflowRoute);

//attendance
app.use('/api/attendance', attendanceRoutes);

//manager routes
app.use('/api/manager', managerRoutes);

//Broadcast routes
app.use('/api/broadcast', broadcastRoutes);

//Dashboard routes
app.use('/api/dashboard', dashboardRoutes);

//HR Routes

app.use('/api/hr', hrRoutes);

// Email Template routes
app.use('/api/email', emailTemplateRoutes);






async function start() {
  try {
    await sequelize.authenticate();
    console.log('Postgres connected');

    // Sync DB models (dev only). In production use migrations.
    /*await sequelize.sync({ alter: true });*/
    console.log('Database synchronized');

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start app', err);
    process.exit(1);
  }
}

// 🧹 Graceful shutdown handler
process.on('SIGINT', async () => {
  console.log('\n🛑 Caught SIGINT, closing database connection...');
  await db.sequelize.close();
  console.log('✅ Database connection closed. Exiting...');
  process.exit(0);
});

if (process.env.NODE_ENV !== 'test') {
  start().catch(err => { console.error(err); process.exit(1); });
}


module.exports = app;

