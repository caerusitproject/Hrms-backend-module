require('dotenv').config();
const app = require('./app');
const sequelize = require('./db');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Postgres connected");

    // Optional in dev only
    // await sequelize.sync({ alter: true });

    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();

// Graceful Shutdown
process.on("SIGINT", async () => {
  console.log("🛑 Closing DB connection...");
  await sequelize.close();
  process.exit(0);
});