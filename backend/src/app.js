require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./db');
const employeeRoutes = require("./routes/employeeRoutes");
const departmentRoutes = require('./routes/departmentRoutes');
const authRoutes = require('./routes/authRoute');
const roleRoutes = require("./routes/roleRoutes");
const leaveRoute = require("./routes/leaveRotes");
const setupSwagger = require("./swagger");
const workflowRoute = require('./routes/workflowRouter');
const attendanceRoutes = require('./routes/attendanceRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const adminRoutes = require("./routes/admin/adminRoutes");
const app = express();
const cors = require('cors');
const path = require('path')
const PORT = process.env.PORT || 5000;
const {authenticate} = require("../src/middleware/authMiddleWare");





// Swagger
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use('/api', routes);

// Admin-only routes
app.use("/api/admin", adminRoutes);

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

start();
