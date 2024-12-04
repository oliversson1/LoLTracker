import express from 'express';
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
