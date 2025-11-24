require('dotenv').config();
const app = require('./app');
const sequelize = require('./db');
const { seedInitialData } = require("./bootstrap/seedInitialData");
const {  swaggerDocs } = require('./swagger.js')
const swaggerUi = require('swagger-ui-express');



const PORT = process.env.PORT || 5000;


async function start() {
  try {
    
    await sequelize.authenticate();
    console.log("Postgres connected");

    // Optional in dev only
     await sequelize.sync({ alter: false });

      await seedInitialData();
      //await swaggerDocs(app);
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
   
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

// 🧹 Graceful shutdown handler
process.on('SIGINT', async () => {
  console.log('\n🛑 Caught SIGINT, closing database connection...');
  await sequelize.close();
  console.log('✅ Database connection closed. Exiting...');
  process.exit(0);
});

if (process.env.NODE_ENV !== 'test') {
  start().catch(err => { console.error(err); process.exit(1); });
}
