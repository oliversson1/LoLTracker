import express from 'express';
import cors from 'cors';
import prisma from './db.js'; 

const app = express();

app.use(express.json());
app.use(cors());

app.get('/api/favorite-champions', async (req, res) => {
  try {
    const champions = await prisma.favoriteChampion.findMany();
    res.json(champions);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving champions');
  }
});


  app.post('/api/favorite-champions', async (req, res) => {
    const { name, role } = req.body;
    try {
      const newChampion = await prisma.favoriteChampion.create({
        data: { name, role },
      });
      res.status(201).json(newChampion); 
    } catch (error) {
      console.error(error);
      res.status(500).send('Error adding champion');
    }
  });
  
  
  app.put('/api/favorite-champions/:id', async (req, res) => {
    const { id } = req.params;
    const { note } = req.body; 
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
      if (error.code === 'P2025') {
        res.status(404).send('Champion not found');
      } else {
        res.status(500).send('Error updating champion');
      }
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
