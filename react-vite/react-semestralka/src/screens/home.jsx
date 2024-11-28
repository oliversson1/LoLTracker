import React from "react";
import Navbar from "../components/Navbar";


export default function Home() {

    return(
        <div className="header_section_mp">
            <h1>Enter Summoner's name:</h1>
            <input id="gameName" type="text" className="find_txt" />
            <input type="button" className="find_btn" value="Find the Summoner" />
        </div>
    );
}
