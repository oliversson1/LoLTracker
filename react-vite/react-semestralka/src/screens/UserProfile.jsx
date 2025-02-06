import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [favoriteChampions, setFavoriteChampions] = useState([]);
  const [summoner, setSummoner] = useState(null);

  const fetchData = async (url, setter) => {
    try {
      const token = Cookies.get("accessToken");
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setter(response.data);
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
    }
  };

  useEffect(() => {
    fetchData("http://localhost:5000/api/user", setUser);
    fetchData("http://localhost:5000/api/favorite-champions", setFavoriteChampions);
    fetchData("/api/user/summoner", setSummoner);
  }, []);

  return (
    <div>
      {user ? (
        <div className="main_container">
          <h2>{user.username}'s Profile</h2>
          {user.profileImage && (
            <img src={`http://localhost:5000${user.profileImage}`} alt="Profile" width="100" />
          )}

          <div style={{ marginTop: "20px", color: "#A0C4FF" }}>
            <h3>Linked Summoner</h3>
            {summoner && summoner.gameName ? (
              <div>
                <p>
                  <strong>
                    {summoner.gameName}#{summoner.tagLine}
                  </strong>
                </p>
              </div>
            ) : (
              <p>No linked summoner.</p>
            )}
          </div>

          <div style={{ marginTop: "20px", color: "#A0C4FF" }}>
            <h3>Favorite Champions</h3>
            {favoriteChampions.length > 0 ? (
              <ul className="champion-list">
                {favoriteChampions.map((champ) => (
                  <li key={champ.id} className="champion-item">
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/13.21.1/img/champion/${champ.name}.png`}
                      alt={champ.name}
                      width="50"
                    />
                    <strong>{champ.name}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No favorite champions set.</p>
            )}
          </div>
        </div>
      ) : (
        <p>Loading your profile...</p>
      )}
    </div>
  );
};

export default UserProfile;