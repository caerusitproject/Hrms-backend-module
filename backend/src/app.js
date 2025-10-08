require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./db');
const employeeRoutes = require("./routes/employeeRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const path = require('path')
const PORT = process.env.PORT || 5000;
const adminRoutes = require('./routes/admin/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const roleRoutes = require("./routes/roleRoutes");
const leaveRoute = require("./routes/leaveRotes");
const setupSwagger = require("./swagger");
const workflowRoute = require('./routes/workflowRouter');
const app = express();
const cors = require('cors');

// Swagger
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use('/api', routes);

// Admin-only routes
app.use("/api/auth", authRoutes);
//app.use("/api/admin", adminRoutes);
app.use("/api/roles", roleRoutes);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/employees", employeeRoutes);
app.use("/upload", uploadRoutes);
//Leave request
app.use("/api/leave/", leaveRoute);

//workflow
app.use('/api/workflow', workflowRoute);






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
