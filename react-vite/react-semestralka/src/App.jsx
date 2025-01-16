import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import SummonerPage from './screens/summonerpage.jsx';
import ChampionsPage from './screens/champions.jsx';
import HomePage from './screens/home.jsx';
import Login from './screens/login.jsx';
import ChampionRotations from './screens/ChampionRotations.jsx';
import FavoriteChampionsPage from './screens/FavoriteChampionsPage.jsx';
import TournamentPage from './screens/TournamentPage.jsx';
import PrivateRoute from './routes/PrivateRoute.jsx';
import Users from './screens/Users.jsx';

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ paddingTop: '10rem' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/champions" element={<ChampionsPage />} />
          <Route path="/summonerpage" element={<SummonerPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/championrotations" element={<ChampionRotations />} />
          <Route path="/FavoriteChampionsPage" element={<FavoriteChampionsPage />} />
          <Route path="/TournamentPage" element={<TournamentPage />} />
          <Route
            path="/Users"
            element={
              <PrivateRoute>
                <Users />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
