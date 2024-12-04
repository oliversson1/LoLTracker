import React, { useState } from 'react';
import axios from 'axios';


export default function ChampionRotations() {
    const [champions, setChampions] = useState([]);
    
    async function fetchChampionRotations() {
        try {
            const apiKey = import.meta.env.VITE_RIOT_API_KEY;
            const response = await axios.get(`https://eun1.api.riotgames.com/lol/platform/v3/champion-rotations?api_key=${apiKey}`);
            console.log('API response:', response.data); 
            setChampions(response.data); 
        } catch (error) {
            console.error('Error fetching champion rotations:', error);
        }
    }

    return (
        <div>
            <h1>Champion Rotations</h1>
            <button onClick={fetchChampionRotations}>Get Champion Rotations</button>
            <ul>
                {champions.freeChampionIds && champions.freeChampionIds.map((championId) => (
                    <li key={championId}>{championId}</li>
                ))}
            </ul>
        </div>
    );
}
