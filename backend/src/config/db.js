const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let pool = null;
let sqliteDb = null;
const isSqlite = process.env.DB_TYPE === 'sqlite' || !process.env.DB_TYPE;

async function init() {
  if (isSqlite) {
    const dbPath = path.resolve(__dirname, '../database/database.sqlite');
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    const dbExists = fs.existsSync(dbPath);
    
    sqliteDb = new sqlite3.Database(dbPath);
    
    // Promisify SQLite methods
    sqliteDb.query = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        sqliteDb.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    };
    
    sqliteDb.runQuery = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        sqliteDb.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ insertId: this.lastID, affectedRows: this.changes });
        });
      });
    };
    
    if (!dbExists) {
      console.log('Initializing SQLite database file...');
      try {
        const schemaSql = fs.readFileSync(path.resolve(__dirname, '../database/schema.sql'), 'utf8');
        const seedSql = fs.readFileSync(path.resolve(__dirname, '../database/seed.sql'), 'utf8');
        
        await executeSqlBatch(schemaSql);
        await executeSqlBatch(seedSql);
        console.log('SQLite database initialized and seeded successfully.');
      } catch (err) {
        console.error('Failed to initialize/seed SQLite database:', err.message);
      }
    } else {
      console.log('SQLite database file already exists.');
    }
  } else {
    // MySQL configuration
    try {
      pool = mysql.createPool({
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'quiz_platform',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      console.log('Connected to MySQL Pool.');
    } catch (err) {
      console.error('Failed to connect to MySQL database:', err.message);
    }
  }
}

async function executeSqlBatch(sqlText) {
  // Bulletproof state-machine SQL splitter that tracks single quotes
  const statements = [];
  let current = '';
  let inQuote = false;
  
  for (let i = 0; i < sqlText.length; i++) {
    const char = sqlText[i];
    
    // Toggle quote state
    if (char === "'" && (i === 0 || sqlText[i - 1] !== '\\')) {
      inQuote = !inQuote;
    }
    
    // Split on semicolon if NOT inside a string literal
    if (char === ';' && !inQuote) {
      statements.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  if (current.trim()) {
    statements.push(current.trim());
  }
  
  const cleanStatements = statements.map(stmt => stmt.trim()).filter(stmt => stmt.length > 0);
  
  for (const stmt of cleanStatements) {
    // Basic DDL translation from MySQL to SQLite syntax
    let sqliteStmt = stmt
      .replace(/INT\s+AUTO_INCREMENT\s+PRIMARY\s+KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
      .replace(/INT\s+AUTO_INCREMENT/gi, 'INTEGER')
      .replace(/AUTO_INCREMENT/gi, '')
      .replace(/TIMESTAMP\s+DEFAULT\s+CURRENT_TIMESTAMP\s+ON\s+UPDATE\s+CURRENT_TIMESTAMP/gi, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
      .replace(/BOOLEAN/gi, 'INTEGER')
      .replace(/FLOAT/gi, 'REAL');
      
    try {
      await new Promise((resolve, reject) => {
        sqliteDb.run(sqliteStmt, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } catch (err) {
      console.error('SQL Execution error in SQLite migration:', err.message, '\nStatement:', sqliteStmt);
    }
  }
}

async function query(sql, params = []) {
  if (isSqlite) {
    if (!sqliteDb) {
      await init();
    }
    
    // SQLite uses `?` for placeholders, same as MySQL
    const isWrite = /^\s*(INSERT|UPDATE|DELETE|REPLACE)\b/i.test(sql);
    
    if (isWrite) {
      const res = await sqliteDb.runQuery(sql, params);
      return [res];
    } else {
      const rows = await sqliteDb.query(sql, params);
      return [rows];
    }
  } else {
    // MySQL query
    if (!pool) {
      throw new Error('MySQL connection pool has not been initialized.');
    }
    const [rows, fields] = await pool.execute(sql, params);
    return [rows, fields];
  }
}

module.exports = {
  init,
  query,
  isSqlite
};
