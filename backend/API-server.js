import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

const app = express();
app.use(cors());

dotenv.config();

const RIOT_API_KEY = process.env.RIOT_API_KEY;

console.log("Loaded Riot API Key:", RIOT_API_KEY); 

async function fetchChampionRotations(req, res) {
    try {
        const response = await axios.get('https://na1.api.riotgames.com/lol/platform/v3/champion-rotations', {
            headers: {
                'X-Riot-Token': RIOT_API_KEY,
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching champion rotations:', error);
        res.status(500).send('Error fetching champion rotations');
    }
}

async function fetchSummonerByRiotId(req, res) {
    const { gameName, tagLine } = req.params;
    try {
        
        const response = await axios.get(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`, {
            headers: {
                'X-Riot-Token': RIOT_API_KEY,
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching summoner data:', error);
        res.status(500).send('Error fetching summoner data');
    }
}

async function fetchSummonerByPUUID(req, res) {
    const { puuid } = req.params;
    try {
        const response = await axios.get(`https://eun1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`, {
            headers: {
                'X-Riot-Token': RIOT_API_KEY,
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching summoner by PUUID:', error);
        res.status(500).send('Error fetching summoner by PUUID');
    }
}

app.get('/riot/lol/platform/v3/champion-rotations', fetchChampionRotations);
app.get('/riot/riot/account/v1/accounts/by-riot-id/:gameName/:tagLine', fetchSummonerByRiotId);
app.get('/riot/lol/summoner/v4/summoners/by-puuid/:puuid', fetchSummonerByPUUID);


function startServer() {
    const port = 8080;
    app.listen(port, function () {
        console.log(`Server running at https://localhost:${port}`);
    });
}

startServer();
