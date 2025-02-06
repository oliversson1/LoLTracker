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
import AdminRoute from './routes/AdminRoute.jsx';
import AdminPanel from './screens/AdminPanel.jsx';
import UserProfile from './screens/UserProfile.jsx';
import PrivateRoute from './routes/PrivateRoute.jsx';
import BugReporting from './screens/BugReporting.jsx';


function App() {
  
  return (
    <Router>
      <Navbar />
      <div style={{ paddingTop: '10rem' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/champions" element={<ChampionsPage />} />
          <Route path="/TournamentPage" element={<TournamentPage />} />

          <Route 
            path="/summonerpage" 
            element={
              <PrivateRoute>
                <SummonerPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/championrotations" 
            element={
              <PrivateRoute>
                <ChampionRotations />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/FavoriteChampionsPage" 
            element={
              <PrivateRoute>
                <FavoriteChampionsPage />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/AdminPanel" 
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } 
          />
        

          <Route 
            path="/UserProfile" 
            element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/BugReporting" 
            element={
              <PrivateRoute>
                <BugReporting />
              </PrivateRoute>
            } 
          />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
