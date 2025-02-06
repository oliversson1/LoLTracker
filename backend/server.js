import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import prisma from './db.js'; 
import bcrypt from 'bcryptjs'; 
import jwt from 'jsonwebtoken'; 
import { z } from 'zod';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

app.use('/uploads', express.static('uploads'));

const upload = multer({ storage: storage });
const JWT_SECRET = process.env.JWT_SECRET;        
const REFRESH_SECRET = process.env.REFRESH_SECRET; 


function generateAccessToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '60m' });
}

function generateRefreshToken(userId) {
  return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });
}



/* ----------------------------------- REGISTRÁCIA ----------------------------------- */
app.post('/api/register', upload.single('image'), async (req, res) => {
  const { username, password } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null; 

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        profileImage: imagePath, 
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

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
      },
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

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      maxAge: 15 * 60 * 1000,  
    });

    res.cookie('role', user.role, {
      httpOnly: false,
      sameSite: 'strict',
      secure: false,
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
    if (!user) {
      return res.status(403).json({ error: 'Invalid refresh token.' });
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(403).json({ error: 'Expired or invalid refresh token.' });
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
    await prisma.refreshToken.delete({
      where: { token: refreshToken },
    });

    res.clearCookie('refreshToken');
    res.clearCookie('username');
    res.clearCookie('role');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error logging out');
  }
});

/* -------------------------------- AUTENTIFIKACIA -------------------------------- */
const authenticate = (req, res, next) => {
  const { accessToken } = req.cookies; 

  if (!accessToken) {
    return res.status(401).json({ error: 'No access token cookie' });
  }

  try {
    const decoded = jwt.verify(accessToken, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log('Invalid or expired access token:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/* --------------------------------- TOURNAMENT ENDPOINTY --------------------------------- */

/* ----------------------------------- Vytvorenie turnaja ----------------------------------- */
app.post('/api/tournaments', authenticate, async (req, res) => {
  const { name, date } = req.body;

  if (!name || !date) {
    return res.status(400).json({ error: "Name and date are required." });
  }

  try {
    const newTournament = await prisma.tournament.create({
      data: {
        name,
        date: new Date(date),
        status: "upcoming",
        creatorId: req.userId,
      },
    });

    res.status(201).json(newTournament);
  } catch (error) {
    console.error("Error creating tournament:", error);
    res.status(500).send("Error creating tournament");
  }
});

/* ----------------------------------- Vymazanie turnaja (iba pre tvorcu) ----------------------------------- */
app.delete('/api/tournaments/:tournamentId', authenticate, async (req, res) => {
  const { tournamentId } = req.params;

  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: parseInt(tournamentId) },
      include: { creator: true },
    });

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.creatorId !== req.userId) {
      return res.status(403).json({ error: 'Only the creator can delete this tournament' });
    }

    await prisma.tournament.delete({
      where: { id: parseInt(tournamentId) },
    });

    res.status(200).json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting tournament');
  }
});


/* ----------------------------------- Získanie počtu účastníkov v turnaji ----------------------------------- */
app.get('/api/tournaments', async (req, res) => {
  try {
    const tournaments = await prisma.tournament.findMany({
      include: {
        participants: {
          include: { user: true } 
        },
        creator: true, 
      },
    });

    res.json(tournaments);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error getting tournaments');
  }
});


/* ----------------------------------- Pripojenie používateľa k turnaju ----------------------------------- */
app.post('/api/tournaments/:tournamentId/join', authenticate, async (req, res) => {
  const { tournamentId } = req.params;

  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: parseInt(tournamentId) },
    });

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    const existingParticipant = await prisma.tournamentParticipant.findFirst({
      where: { tournamentId: parseInt(tournamentId), userId: req.userId },
    });

    if (existingParticipant) {
      return res.status(400).json({ error: 'You are already registered in this tournament' });
    }
    await prisma.tournamentParticipant.create({
      data: {
        tournamentId: parseInt(tournamentId),
        userId: req.userId,
      },
    });

    res.status(201).json({ message: 'Successfully joined the tournament' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error joining tournament');
  }
});

/* ----------------------------------- Odhlásenie sa z turnaja ----------------------------------- */
app.delete('/api/tournaments/:tournamentId/leave', authenticate, async (req, res) => {
  const { tournamentId } = req.params;

  try {
    const participant = await prisma.tournamentParticipant.findFirst({
      where: { tournamentId: parseInt(tournamentId), userId: req.userId },
    });

    if (!participant) {
      return res.status(400).json({ error: 'You are not registered in this tournament' });
    }

    await prisma.tournamentParticipant.delete({
      where: { id: participant.id },
    });

    res.status(200).json({ message: 'Successfully left the tournament' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error leaving tournament');
  }
});

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
      data: { note },
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
    await prisma.favoriteChampion.delete({ where: { id: Number(id) } });
    res.status(200).send('Champion deleted');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting champion');
  }
});

/*--------------------------------------Získanie všetkých používateľov (pre admin rolu, aby mohli mazať)---------------------------------*/
/* ---------------------------- Získanie všetkých používateľov (len pre adminov) ---------------------------- */
app.get('/api/users', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied, admin only.' });
    }

    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching users');
  }
});

app.get('/api/user', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user); 
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send('Error fetching user');
  }
});


/* ---------------------------- Vymazanie používateľa (len pre adminov) ---------------------------- */
app.delete('/api/users/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied, admin only.' });
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.delete({ where: { id: parseInt(id) } });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting user');
  }
});


app.get('/api/protected', (req, res) => {
  const { accessToken } = req.cookies;  

  try {
    const decoded = jwt.verify(accessToken, JWT_SECRET);  
    res.status(200).json({ message: 'Access granted' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Token expired' });
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  }
});

/*----------------------------------------------Pridanie summonera k profilu----------------------------------------------*/
app.post('/api/summoners/add', authenticate, async (req, res) => {

  const { puuid, gameName, tagLine } = req.body;

  if (!puuid || !gameName || !tagLine) {
    console.error("Missing required fields. Received:", { puuid, gameName, tagLine });
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    if (!user) {
      console.error("User not found in database.");
      return res.status(404).json({ error: 'User not found.' });
    }

    await prisma.user.update({
      where: { id: req.userId },
      data: {
        riotPuuid: puuid,
        riotGameName: gameName,
        riotTagLine: tagLine,
      },
    });

    res.status(200).json({ message: 'Summoner linked successfully (previous summoner was replaced).' });
  } catch (error) {
    console.error('Error linking summoner:', error);
    res.status(500).send('Error linking summoner.');
  }
});




app.get('/api/user/summoner', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        riotPuuid: true,
        riotGameName: true,
        riotTagLine: true,
      }
    });


    if (!user || !user.riotPuuid) {
      return res.status(404).json({ error: 'No linked summoner found.' });
    }

    res.json({
      puuid: user.riotPuuid,
      gameName: user.riotGameName,
      tagLine: user.riotTagLine,
    });

  } catch (error) {
    console.error('Error fetching summoner from DB:', error);
    res.status(500).json({ error: 'Failed to fetch summoner data.' });
  }
});



app.get('/api/summoners/check/:puuid', authenticate, async (req, res) => {
  const { puuid } = req.params;

  try {
    const user = await prisma.user.findFirst({ where: { riotPuuid: puuid } });

    if (user) {
      return res.json({ isOwned: true, owner: user.username });
    } else {
      return res.json({ isOwned: false });
    }
  } catch (error) {
    console.error('Error checking summoner ownership:', error);
    res.status(500).json({ error: 'Failed to check summoner ownership.' });
  }
});




const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});