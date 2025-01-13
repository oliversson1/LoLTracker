import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import summonerIcon from "../assets/icon.png";

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
        axios.get(`/api/summoners/check/${account.puuid}`)
            .then((response) => {
                if (response.data.isOwned) {
                    setIsOwned(true);
                    setMessage("This summoner is already linked to another user.");
                }
            })
            .catch((error) => {
                console.error("Error checking summoner ownership:", error);
            });
    }, [account.puuid]);


    const addSummonerToAccount = () => {
        axios.post("/api/summoners/add", {
            puuid: account.puuid,
            gameName: account.gameName,
            tagLine: account.tagLine
        })
        .then(() => {
            setIsOwned(true);
            setMessage("Summoner successfully linked to your account.");
        })
        .catch((error) => {
            setMessage("Error linking summoner: " + error.response.data.error);
        });
    };

    return (
        <div className="main_container">
            <img src={summonerIcon} alt="player icon" />
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
