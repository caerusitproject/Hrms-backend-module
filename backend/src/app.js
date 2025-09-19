require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./db');
const employeeRoutes = require("./routes/employeeRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const path = require('path')
const PORT = process.env.PORT || 5000;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use('/api', routes);


app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/employees", employeeRoutes);
app.use("/upload", uploadRoutes);








async function start() {
  try {
    await sequelize.authenticate();
    console.log('Postgres connected');

    // Sync DB models (dev only). In production use migrations.
    await sequelize.sync({ alter: true });
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
