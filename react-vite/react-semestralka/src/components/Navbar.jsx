import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import NavLogo from '../assets/navlogo.png';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const username = Cookies.get('username');

      await axios.post('http://localhost:5000/api/logout', null, {
        withCredentials: true,
      });
      Cookies.remove('username');

      alert(`User "${username}" was logged out.`);

      // Presmerujeme na login
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout error');
    }
  };

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

        <button
          onClick={handleLogout}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red' }}
        >
          Logout
        </button>
      </nav>
    </div>
  );
}
