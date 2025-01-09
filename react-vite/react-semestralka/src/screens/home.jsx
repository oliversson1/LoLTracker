import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const [gameName, setGameName] = useState("");
    const [tagLine, setTagLine] = useState("");
    const navigate = useNavigate(); 

async function fetchSummoner(gameName, tagLine) {
    if (!gameName || !tagLine) {
        alert("Please enter both Summoner's name and Tag Line.");
        return;
    }

    try {
        const accountUrl = `/api/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;
        console.log("Fetching account data from:", accountUrl);  
        const accountResponse = await axios.get(accountUrl);
        console.log("Account Response:", accountResponse);
        const account = accountResponse.data;
        console.log("Account data:", account);
        const apiKey = import.meta.env.VITE_RIOT_API_KEY;

        const summonerUrl = `https://eun1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${account.puuid}?api_key=${apiKey}`;

        console.log("Fetching summoner data from:", summonerUrl); 
        const summonerResponse = await axios.get(summonerUrl);
        console.log("Summoner Response:", summonerResponse);  
        const summonerData = summonerResponse.data;
        console.log("Summoner data:", summonerData);

        navigate(`/summonerpage`, { state: { account, summoner: summonerData } });
    } catch (error) {
        console.error("Error during API calls:", error);
        alert("An error occurred while fetching summoner data.");
    }
}


    return (
        <div className="header_section_mp">
            <h1>Enter Summoner's name:</h1>
            <input
                type="text"
                className="find_txt"
                placeholder="Summoner Name"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)} 
            />
            <input
                type="text"
                className="find_txt"
                placeholder="Tag Line (e.g., EUW)"
                value={tagLine}
                onChange={(e) => setTagLine(e.target.value)}
            />
            <input
                type="button"
                className="find_btn"
                value="Find the Summoner"
                onClick={() => fetchSummoner(gameName, tagLine)} 
            />
        </div>
    );
}
