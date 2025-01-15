require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const passport = require('passport');
const db = require('./config/db'); // Conexiunea la baza de date
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();
const port = 3000;

// Middleware-uri
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
}));

// Inițializează Passport și sesiunea
app.use(passport.initialize());
app.use(passport.session());


// Ruta pentru dashboard
app.get('/dashboard', (req, res) => {
  console.log('Dashboard endpoint accessed');
  res.json({ message: 'Welcome to the dashboard' });
});

// Adaugă ruta pentru autentificare
app.post('/login', async (req, res) => {
  const token = req.body.token;
  console.log(token);

  if (!token) {
    return res.status(400).json({ success: false, message: 'Token missing' });
  }

  try {
    // Verifică și decodează token-ul JWT primit de la frontend
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Verifică dacă ID-ul clientului este corect
    });

    const payload = ticket.getPayload();
    const email = payload.email;

    // Verifică utilizatorul în baza de date
    db.query('SELECT * FROM users WHERE email = $1', [email], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (result.rows.length === 0) {
        // Dacă utilizatorul nu există, creează-l
        console.log('User not found, creating new user.');
        db.query(
          'INSERT INTO users (name, given_name, family_name, email, picture) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [payload.name, payload.given_name, payload.family_name, email, payload.picture],
          (err, result) => {
            if (err) {
              console.error('Error inserting user:', err);
              return res.status(500).json({ success: false, message: 'Error inserting user' });
            }
            console.log('New user created:', result.rows[0]);
            res.json({ success: true, message: 'User created and authenticated' });
          },
        );
      } else {
        // Dacă utilizatorul există deja
        console.log('User found:', result.rows[0]);
        res.json({ success: true, message: 'User authenticated' });
      }
    });

  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(400).json({ success: false, message: 'Invalid token' });
  }
});

// Pornire server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
