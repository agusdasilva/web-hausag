const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('hausag.sqlite');

db.run(`UPDATE Products SET category='Griferías' WHERE category='Accesorios';`, function(err) {
  if (err) {
    console.error(err.message);
  } else {
    console.log(`Row(s) updated: ${this.changes}`);
  }
  db.close();
});
