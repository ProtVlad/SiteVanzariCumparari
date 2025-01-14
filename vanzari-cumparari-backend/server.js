const express = require('express');
const { Pool } = require('pg'); // PostgreSQL client
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware pentru parsarea JSON-ului
app.use(express.json());
app.use(cors());

// Configurarea conexiunii la baza de date PostgreSQL
const pool = new Pool({
  user: 'postgres', 
  host: 'localhost',
  database: 'vanzari_cumparari',
  password: '1q2w3e',
  port: 5432,
});

// Testarea conexiunii la baza de date
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to PostgreSQL database!');
  release();
});

// Endpoint pentru inserarea unui utilizator
app.post('/api/users', async (req, res) => {
  const { given_name, family_name, email, name, picture } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO users (given_name, family_name, email, name, picture) VALUES ($1, $2, $3, $4, $5)',
      [given_name, family_name, email, name, picture]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Endpoint pentru listarea utilizatorilor
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Pornirea serverului
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
