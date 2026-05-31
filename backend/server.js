require('dotenv').config();
const app = require('./src/app');
const db = require('./src/config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('Initializing database storage engine...');
    await db.init();
    
    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`  ONLINE QUIZ & ASSESSMENT PLATFORM SERVER     `);
      console.log(`  Running on: http://localhost:${PORT}        `);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'} `);
      console.log(`  Database type: ${process.env.DB_TYPE || 'sqlite'}   `);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Fatal: Failed to start the backend server:', error.message);
    process.exit(1);
  }
}

startServer();
