import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

export default function SummonerPage() {
    const location = useLocation();
    const { account, summoner } = location.state || {}; 
    const [isOwned, setIsOwned] = useState(false);
    const [message, setMessage] = useState("");
    const username = Cookies.get("username"); 

    if (!account) {
        return <p>No summoner data available. Please search again.</p>;
    }

    useEffect(() => {
        const encodedPuuid = encodeURIComponent(account.puuid);
        axios.get(`/api/summoners/check/${encodedPuuid}`)
            .then((response) => {
                if (response.data.isOwned) {
                    setIsOwned(true);
                    setMessage("This summoner is already linked.");
                }
            })
            .catch((error) => {
                console.error("Error checking summoner ownership:", error);
            });
    }, [account.puuid]);
    


const addSummonerToAccount = () => {
    const requestData = {
        puuid: account?.puuid,
        gameName: account?.gameName,
        tagLine: account?.tagLine,
    };

    console.log("Sending request to /api/summoners/add with data:", requestData);

    axios.post("/api/summoners/add", requestData, { withCredentials: true })
        .then(() => {
            setIsOwned(true);
            setMessage("Summoner successfully linked to your account.");
        })
        .catch((error) => {
            console.error("Error linking summoner:", error.response?.data || error);
            setMessage("Error linking summoner: " + (error.response?.data?.error || error.message));
        });
};

    
    

    const profileIconUrl = `https://ddragon.leagueoflegends.com/cdn/13.21.1/img/profileicon/${summoner.profileIconId}.png`;

    return (
        <div className="main_container">
            <img src={profileIconUrl} alt="Summoner icon" width="100" height="100" />

            <h1 className="summoners_name">{account.gameName}</h1>
            <p>Level {summoner.summonerLevel}</p>
            <p>Tagline: {account.tagLine}</p> 

            {!isOwned ? (
                <button onClick={addSummonerToAccount}>Link summoner to your account</button>
            ) : (
                <p>{message}</p>
            )}
        </div>
    );
}
