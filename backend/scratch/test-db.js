const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../src/database/database.sqlite');
const schemaPath = path.resolve(__dirname, '../src/database/schema.sql');

console.log('Database Path:', dbPath);
console.log('Schema Path:', schemaPath);

// Delete existing DB to start fresh
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Deleted existing database file.');
}

const db = new sqlite3.Database(dbPath);

async function runTest() {
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  
  // Bulletproof state-machine SQL splitter
  const statements = [];
  let current = '';
  let inQuote = false;
  
  for (let i = 0; i < schemaSql.length; i++) {
    const char = schemaSql[i];
    if (char === "'" && (i === 0 || schemaSql[i - 1] !== '\\')) {
      inQuote = !inQuote;
    }
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
  
  const cleanStatements = statements.filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
  
  console.log(`Total statements to run: ${cleanStatements.length}`);
  
  for (let i = 0; i < cleanStatements.length; i++) {
    const stmt = cleanStatements[i];
    let sqliteStmt = stmt
      .replace(/INT\s+AUTO_INCREMENT\s+PRIMARY\s+KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
      .replace(/INT\s+AUTO_INCREMENT/gi, 'INTEGER')
      .replace(/AUTO_INCREMENT/gi, '')
      .replace(/TIMESTAMP\s+DEFAULT\s+CURRENT_TIMESTAMP\s+ON\s+UPDATE\s+CURRENT_TIMESTAMP/gi, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
      .replace(/BOOLEAN/gi, 'INTEGER')
      .replace(/FLOAT/gi, 'REAL')
      .replace(/ON DELETE SET NULL/gi, '')
      .replace(/FOREIGN KEY\s+\([^)]+\)\s+REFERENCES\s+\w+\([^)]+\)\s+ON DELETE SET NULL/gi, '');

    console.log(`Running statement ${i + 1}...`);
    try {
      await new Promise((resolve, reject) => {
        db.run(sqliteStmt, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log(`  [SUCCESS]`);
    } catch (err) {
      console.error(`  [ERROR]:`, err.message);
      console.error(`  Statement:`, sqliteStmt);
    }
  }
  
  // Verify if users table exists
  db.all("SELECT name FROM sqlite_master WHERE type='table';", [], (err, rows) => {
    if (err) {
      console.error('Error listing tables:', err.message);
    } else {
      console.log('Created Tables:', rows.map(r => r.name));
    }
    db.close();
  });
}

runTest();
