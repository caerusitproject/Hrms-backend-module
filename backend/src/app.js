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
const emailRoutes = require('./routes/emailRoutes');
const compensationRoutes = require('./routes/payroll/compensationRoutes')
const payrollRoutes = require('./routes/payroll/payrollRoutes');
const aiRoutes = require("./routes/ai/aiRoutes");
const swaggerUi = require("swagger-ui-express");
//const swaggerDocument = require('./openapiv3.json');
require("./logger");

const app = express();
const cors = require('cors');
const path = require('path')
const PORT = process.env.PORT || 5000;
const { generateSwagger } = require("./util/swaggerAutoGen");
app.use(express.json());


// Swagger
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const swaggerSpec = generateSwagger();



app.use(express.static(path.join(__dirname, '../uploads')));
console.log("Static serving from:", path.join(__dirname, "../uploads"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
//app.use('/api', routes);
//swaggerUi.setup

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

app.use("/api/upload", uploadRoutes);
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

// Sending Email Routes
app.use('/api/email/send', emailRoutes);

//AI chat 

app.use("/api/ai", aiRoutes);

process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION", err);
});

process.on("unhandledRejection", (reason) => {
  logger.error("UNHANDLED PROMISE REJECTION", reason);
});





module.exports = app;

