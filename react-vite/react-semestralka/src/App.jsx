import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import SummonerPage from './screens/summonerpage.jsx';
import ChampionsPage from './screens/champions.jsx';
import HomePage from './screens/home.jsx';

function App() {

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/champions" element={<ChampionsPage />} />
        <Route path="/summonerpage" element={<SummonerPage />} />
      </Routes>
    </Router>
  );
}

export default App;
