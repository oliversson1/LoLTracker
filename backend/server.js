import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import prisma from './db.js'; 
import bcrypt from 'bcryptjs'; 
import jwt from 'jsonwebtoken'; 
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(cookieParser());


const JWT_SECRET = process.env.JWT_SECRET;        
const REFRESH_SECRET = process.env.REFRESH_SECRET; 


function generateAccessToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
}

function generateRefreshToken(userId) {
  return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });
}

/* ----------------------------------- REGISTRÁCIA ----------------------------------- */
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body; 

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists.' });
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating user');
  }
});

/* ----------------------------------- PRIHLÁSENIE ----------------------------------- */
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    res.cookie('username', user.username, {
      httpOnly: false,    
      secure: false,       
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, 
    });

    res.json({ message: 'Login successful', accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error logging in');
  }
});

/* ---------------------------------- OBNOVENIE TOKENU ---------------------------------- */
app.post('/api/token', async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token provided.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ error: 'Invalid refresh token.' });
    }

    const newAccessToken = generateAccessToken(user.id);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error(error);
    res.status(403).json({ error: 'Invalid or expired refresh token.' });
  }
});

/* ---------------------------------- ODHLÁSENIE ---------------------------------- */
app.post('/api/logout', async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(400).json({ error: 'No refresh token provided.' });
  }

  try {
    await prisma.user.updateMany({
      where: { refreshToken },
      data: { refreshToken: null },
    });

    res.clearCookie('refreshToken');
    res.clearCookie('username');
    res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error logging out');
  }
});

/* -------------------------------- AUTENTIFIKACIA -------------------------------- */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization token is required' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Invalid token format' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/* --------------------------------- FAVORITE CHAMPION ENDPOINTY --------------------------------- */
app.post('/api/favorite-champions', authenticate, async (req, res) => {
  const { name, role } = req.body;
  if (!name || !role) {
    return res.status(400).json({ error: 'Name and role are required.' });
  }

  try {
    const existingChampion = await prisma.favoriteChampion.findFirst({ where: { name } });
    if (existingChampion) {
      return res.status(400).json({ error: 'Champion already exists.' });
    }

    const newChampion = await prisma.favoriteChampion.create({
      data: {
        name,
        role,
        userId: req.userId,
      },
    });
    res.status(201).json(newChampion);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding champion');
  }
});

// Získanie obľúbených šampiónov
app.get('/api/favorite-champions', authenticate, async (req, res) => {
  try {
    const champions = await prisma.favoriteChampion.findMany({
      where: { userId: req.userId },
    });
    res.json(champions);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error getting champions');
  }
});

// Úprava poznámky
const updateSchema = z.object({
  note: z.string().regex(/^[A-Za-z\s]*$/).optional(),
});

app.put('/api/favorite-champions/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  const result = updateSchema.safeParse({ note });
  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }

  try {
    const updatedChampion = await prisma.favoriteChampion.update({
      where: { id: parseInt(id) },
      data: { note },
    });
    res.status(200).json(updatedChampion);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating champion');
  }
});

// Odstránenie šampióna
app.delete('/api/favorite-champions/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.favoriteChampion.delete({ where: { id: Number(id) } });
    res.status(200).send('Champion deleted');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting champion');
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
