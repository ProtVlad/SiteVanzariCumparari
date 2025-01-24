require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/db'); // Conexiunea la baza de date
const { OAuth2Client } = require('google-auth-library');
const multer = require('multer');
const path = require('path');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();
const port = 3000;

// Middleware-uri
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configurare multer pentru încărcarea fișierelor
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folderul unde salvezi fișierele
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname); // Obține extensia fișierului
    cb(null, uniqueSuffix + extension); // Nume unic + extensia originală
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/bmp', 'image/jpeg', 'image/png'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only BMP, JPG, and PNG are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// Adaugă ruta pentru autentificare
app.post('/login', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

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

            const newUser = result.rows[0]; // Salvează utilizatorul creat
            console.log('New user created:', newUser);
            authenticated = true;

            // Returnează răspuns cu succes și datele utilizatorului (inclusiv ID-ul)
            res.json({
              success: true,
              message: 'User created and authenticated',
              user: {
                id: newUser.id,  // Returnăm ID-ul utilizatorului
                given_name: newUser.given_name,
                family_name: newUser.family_name,
                email: newUser.email,
                name: newUser.name,
                picture: newUser.picture
              }
            });
          },
        );
      } else {
        // Dacă utilizatorul există deja
        const existingUser = result.rows[0];
        console.log('User found:', existingUser);
        authenticated = true;

        // Returnează răspuns cu succes și datele utilizatorului existent (inclusiv ID-ul)
        res.json({
          success: true,
          message: 'User authenticated',
          user: {
            id: existingUser.id,  // Returnăm ID-ul utilizatorului
            given_name: existingUser.given_name,
            family_name: existingUser.family_name,
            email: existingUser.email,
            name: existingUser.name,
            picture: existingUser.picture
          }
        });
      }
    });

  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(400).json({ success: false, message: 'Invalid token' });
  }
});

app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, users: result.rows });
  });
});

app.get('/products', (req, res) => {
  db.query(
    'SELECT products.*, users.name AS publisher FROM products INNER JOIN users ON products.user_id = users.id',
    (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      res.json({ success: true, products: result.rows });
    }
  );
});


// Endpoint pentru adăugarea unui produs
app.post('/products', upload.single('file'), async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(400).json({ success: false, message: 'Token missing' });
  }

  const { name, description, price, user_id, tag } = req.body;
  const filePath = req.file.path; // Calea fișierului pe server

  // Validare date
  if (!name || !description || !price || !filePath || !user_id || !tag) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    // Interogare SQL pentru a adăuga produsul
    const result = await db.query(
      'INSERT INTO products (name, description, price, image, user_id, tag) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, description, price, filePath, user_id, tag]
    );

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product: result.rows[0],  // returnăm produsul adăugat
    });
  } catch (error) {
    console.error('Error inserting product:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/products/:id', async (req, res) => {
  const { id } = req.params; // Preluăm ID-ul produsului din URL

  try {
    const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Produsul nu a fost găsit' });
    }

    res.json({ success: true, product: result.rows[0] }); // Returnăm produsul găsit
  } catch (error) {
    console.error('Eroare la obținerea produsului:', error);
    res.status(500).json({ success: false, message: 'Eroare de server' });
  }
});



app.get('/users/:id', async (req, res) => {
  const { id } = req.params; // Preluăm ID-ul produsului din URL

  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    console.log(result);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Utilizatorul nu a fost găsit' });
    }

    res.json({ success: true, user: result.rows[0] }); // Returnăm produsul găsit
  } catch (error) {
    console.error('Eroare la obținerea Utilizatorului:', error);
    res.status(500).json({ success: false, message: 'Eroare de server' });
  }
});

app.put('/products/:id', upload.single('file'), async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Preluăm token-ul din header

  if (!token) {
    return res.status(400).json({ success: false, message: 'Token missing' });
  }

  const { id } = req.params; // ID-ul produsului din URL
  const { name, description, price, tag } = req.body; // Datele din corpul cererii
  const filePath = req.file ? req.file.path : null; // Fișierul încărcat

  // Validare date
  if (!name || !description || !price || !tag) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  // Verificăm dacă fișierul a fost trimis
  if (!filePath) {
    return res.status(400).json({ success: false, message: 'File is required for updating product' });
  }

  try {

    // Actualizare a produsului
    const updateQuery = `
      UPDATE products
      SET name = $1, description = $2, price = $3, image = $4, tag = $5
      WHERE id = $6
      RETURNING *`;

    const updateValues = [
      name, 
      description, 
      price, 
      filePath,  // Actualizăm cu calea fișierului încărcat
      tag,
      id
    ];

    const result = await db.query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not updated' });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: result.rows[0], // Returnăm produsul actualizat
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


app.delete('/products', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Preluăm token-ul din header

  if (!token) {
    return res.status(400).json({ success: false, message: 'Token missing' });
  }

  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ success: false, message: 'Product ID is required' });
  }

  try {
    // Ștergem produsul din baza de date
    const result = await db.query('DELETE FROM products WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Product not found or you are not authorized to delete it' });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/comments', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(400).json({ success: false, message: 'Token missing' });
  }

  const { description, product_id, user_id } = req.body;
  // Validare date
  if (!description || !product_id || !user_id) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    // Interogare SQL pentru a adăuga comentariul
    const result = await db.query(
      `INSERT INTO comments (description, created, product_id, user_id) 
       VALUES ($1, NOW(), $2, $3) RETURNING *`,
      [description, product_id, user_id]
    );

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: result.rows[0], // returnăm comentariul adăugat
    });
  } catch (error) {
    console.error('Error inserting comment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/comments/:productId', async (req, res) => {
  const { productId } = req.params; // Preluăm ID-ul produsului din URL

  try {
    const result = await db.query('SELECT comments.id, comments.description, comments.created, comments.user_id, users.name, users.picture FROM comments JOIN users ON comments.user_id = users.id WHERE product_id = $1 ORDER BY comments.created DESC;', [productId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Nu există comentarii pentru acest produs' 
      });
    }

    res.json({ 
      success: true, 
      comments: result.rows // Returnăm toate comentariile pentru produs
    });
  } catch (error) {
    console.error('Eroare la obținerea comentariilor:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare de server' 
    });
  }
});

// Endpoint pentru preluarea tuturor tag-urilor
app.get('/tags', async (req, res) => {
  try {
    const result = await db.query('SELECT DISTINCT tag FROM products');

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Nu există tag-uri disponibile' 
      });
    }

    res.json({ 
      success: true, 
      tags: result.rows.map(row => row.tag) // Extragem doar valorile tag-urilor într-un array simplu
    });
  } catch (error) {
    console.error('Eroare la obținerea tag-urilor:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare de server' 
    });
  }
});

// Pornire server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
