import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
const port = 3000;
const jwtSecret = 'your_jwt_secret'; // Use a secure and unique secret in production

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for frontend communication

// Database connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'your_db_user',
  password: 'your_db_password',
  database: 'auth_app',
});

// Helper function to generate JWT
const generateToken = (id: number) => {
  return jwt.sign({ id }, jwtSecret, { expiresIn: '1h' });
};

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    const userId = (result as any).insertId;
    const token = generateToken(userId);

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);

    if ((rows as any).length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = (rows as any)[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
});

// Example protected route
app.get('/attendance', authenticateToken, async (req, res) => {
  // Example logic to fetch attendance data for the authenticated user
  // Adjust based on your actual attendance schema and requirements
  const [rows] = await db.execute('SELECT * FROM attendance WHERE user_id = ?', [req.user.id]);
  res.status(200).json(rows);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
