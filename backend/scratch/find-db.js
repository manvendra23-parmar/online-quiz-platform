const path = require('path');
const fs = require('fs');

console.log('--- Database File Location Diagnostics ---');
console.log('Current Working Directory (Cwd):', process.cwd());
console.log('db.js __dirname would be:', path.resolve(__dirname, '../config'));

const paths = [
  { name: 'src/database/database.sqlite', path: path.resolve(__dirname, '../database/database.sqlite') },
  { name: 'backend/database.sqlite', path: path.resolve(__dirname, '../../database.sqlite') },
  { name: 'src/config/database.sqlite', path: path.resolve(__dirname, './database.sqlite') },
  { name: 'process.cwd()/database.sqlite', path: path.resolve(process.cwd(), 'database.sqlite') },
  { name: 'process.cwd()/src/database/database.sqlite', path: path.resolve(process.cwd(), 'src/database/database.sqlite') },
  { name: 'process.cwd()/backend/src/database/database.sqlite', path: path.resolve(process.cwd(), 'backend/src/database/database.sqlite') }
];

paths.forEach(p => {
  const exists = fs.existsSync(p.path);
  console.log(`Checking ${p.name}:\n  Path: ${p.path}\n  Result: ${exists ? 'FOUND! ✅' : 'NOT FOUND ❌'}\n`);
  
  if (exists) {
    try {
      // Try to delete it directly in this script!
      fs.unlinkSync(p.path);
      console.log(`  [SUCCESS] Deleted the file: ${p.name}\n`);
    } catch (err) {
      console.log(`  [FAILED to delete]: ${err.message}\n`);
    }
  }
});

console.log('------------------------------------------');
