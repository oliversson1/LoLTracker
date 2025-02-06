import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import NavLogo from '../assets/navlogo.png';

export default function Navbar() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(Cookies.get('username') || '');
  const [userRole, setUserRole] = useState(Cookies.get('role') || ''); 

  useEffect(() => {
    const checkUser = () => {
      const usernameFromCookie = Cookies.get('username');
      const roleFromCookie = Cookies.get('role');


      setUsername(usernameFromCookie || '');
      setUserRole(roleFromCookie || ''); 
    };

    const interval = setInterval(checkUser, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/logout', null, { withCredentials: true });

      Cookies.remove('username');
      Cookies.remove('role'); 
      setUsername('');
      setUserRole(''); 
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="nav_container">
      <nav>
        <img src={NavLogo} alt="navigation logo" />
        
        <Link to="/">Home</Link>
        <Link to="/champions">Champions</Link>
        <Link to="/TournamentPage">Tournaments</Link>

        {userRole === 'admin' && <Link to="/Users">Admin Panel</Link>}

        {username ? (
          <>
            <Link to="/FavoriteChampionsPage">Favorite Champions</Link>
            <Link to="/UserProfile">Profile</Link>
            <button className="logout_btn" onClick={handleLogout}>Logout ({username})</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
    </div>
  );
}
