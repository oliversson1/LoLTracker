import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NavLogo from '../assets/navlogo.png';

function Navbar() { 
    return (
        <div className="nav_container">
      <nav>
        <img src={NavLogo} alt="navigation logo" />
        <Link to="/">Home</Link>
        <Link to="/champions">Champions</Link>
        <Link to="/summonerpage">Summoner's page</Link>
        <Link to="/login">Login</Link>
        <Link to="/championrotations">Champion Rotations</Link>
        <Link to="/FavoriteChampionsPage">Favorite Champions</Link>
      </nav>
    </div>
    );
}

export default Navbar;
