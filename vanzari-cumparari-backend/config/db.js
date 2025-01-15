const { Pool } = require('pg'); // PostgreSQL client

const db = new Pool({
  user: 'postgres', 
  host: 'localhost',
  database: 'vanzari_cumparari',
  password: '1q2w3e',
  port: 5432,
});

// Testarea conexiunii la baza de date
db.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack);
    }
    console.log('Connected to PostgreSQL database!');
    release();
  });

module.exports = db;