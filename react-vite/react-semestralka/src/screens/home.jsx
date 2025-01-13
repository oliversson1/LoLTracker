import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const [gameName, setGameName] = useState("");
    const [tagLine, setTagLine] = useState("");
    const [errorMessage, setErrorMessage] = useState("");  
    const navigate = useNavigate();

    const showError = (message) => {
        setErrorMessage(message);
        setTimeout(() => setErrorMessage(""), 3000);  
    };

    async function fetchSummoner(gameName, tagLine) {
        if (!gameName || !tagLine) {
            showError("Please enter both Summoner's name and Tag Line.");
            return;
        }
    
        try {
            const accountUrl = `/riot/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;
            console.log("Fetching account data from:", accountUrl);  
    
            const accountResponse = await axios.get(accountUrl);
            const account = accountResponse.data;
            console.log("Account data:", account);
    
            const summonerUrl = `/riot/lol/summoner/v4/summoners/by-puuid/${account.puuid}`;
            console.log("Fetching summoner data from:", summonerUrl); 
    
            const summonerResponse = await axios.get(summonerUrl);
            const summonerData = summonerResponse.data;
            console.log("Summoner data:", summonerData);
    
            navigate(`/summonerpage`, { state: { account, summoner: summonerData } });
        } catch (error) {
            console.error("Error during API calls:", error?.response?.data || error);
            showError("An error occurred while fetching summoner data.");
        }
    }

    return (
        <div className="header_section_mp">
            <h1>Enter Summoner's name:</h1>

            {errorMessage && <div className="error-message">{errorMessage}</div>}

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
