import React from "react";
import { useLocation } from "react-router-dom";
import summonerIcon from "../assets/icon.png";

export default function SummonerPage() {
    const location = useLocation();
    const { account, summoner } = location.state || {}; 

    if (!account) {
        return <p>No summoner data available. Please search again.</p>;
    }

    return (
        <div className="main_container">
            <img src={summonerIcon} alt="player icon" />
            <h1 className="summoners_name">{account.gameName}</h1>
            <p>Level {summoner.summonerLevel}</p>
            <p>Tagline: {account.tagLine}</p> 
        </div>
    );
}
