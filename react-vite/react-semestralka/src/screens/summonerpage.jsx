import React from "react";
import summonerIcon from "../assets/icon.png";

export default function summonerpage() {

    return(
        <div className="main_container">
        <img src={summonerIcon} alt="player icon" />
        <h1 className="summoners_name">Summoner's name</h1>
        <p>level 226</p>
        </div>
    );
}
