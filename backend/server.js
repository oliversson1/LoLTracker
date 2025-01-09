import express from 'express';
import cors from 'cors';
import prisma from './db.js'; 
import bcrypt from 'bcryptjs'; 
import jwt from 'jsonwebtoken'; 
import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();


const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET;

app.post('/api/register', async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
      },
    });

    res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating user');
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error logging in');
  }
});


const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authorization token is required' });
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


app.post('/api/favorite-champions', authenticate, async (req, res) => {
  const { name, role } = req.body;

  if (!name || !role) {
    return res.status(400).json({ error: 'Name and role are required.' });
  }

  try {
    const existingChampion = await prisma.favoriteChampion.findFirst({
      where: { name },
    });

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
      data: {
        note,
      },
    });
    res.status(200).json(updatedChampion); 
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating champion');
  }
});


app.delete('/api/favorite-champions/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.favoriteChampion.delete({
      where: { id: Number(id) }
    });
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


/*import express from 'express';
import cors from 'cors';
import prisma from './db.js'; 
import { z } from 'zod';
const app = express();

app.use(express.json());
app.use(cors());

app.get('/api/favorite-champions', async (req, res) => {
  try {
    const champions = await prisma.favoriteChampion.findMany();
    res.json(champions);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error getting champions');
  }
});

app.post('/api/favorite-champions', async (req, res) => {
    const { name, role } = req.body;
    
    if (!name || !role) {
      return res.status(400).json({ error: 'Name and role are required.' });
    }
  
    try {
      const existingChampion = await prisma.favoriteChampion.findFirst({
        where: { name },
      });
  
      if (existingChampion) {
        return res.status(400).json({ error: 'Champion already exists.' });
      }
  
      const newChampion = await prisma.favoriteChampion.create({
        data: { name, role },
      });
  
      res.status(201).json(newChampion);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error adding champion');
    }
  });
  

  const updateSchema = z.object({
  note: z.string().regex(/^[A-Za-z\s]*$/).optional(),
});


app.put('/api/favorite-champions/:id', async (req, res) => {
    const { id } = req.params;
    const { note } = req.body;
  
    const result = updateSchema.safeParse({ note });
  
    if (!result.success) {
      return res.status(400).json({ errors: result.error.errors });
    }
    try {
      const updatedChampion = await prisma.favoriteChampion.update({
        where: { id: parseInt(id) },
        data: {
          note,
        },
      });
      res.status(200).json(updatedChampion); 
    } catch (error) {
      console.error(error);
        res.status(500).send('Error updating champion');
      
    }
  });
  

app.delete('/api/favorite-champions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.favoriteChampion.delete({
      where: { id: Number(id) }
    });
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
*/