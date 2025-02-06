import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [favoriteChampions, setFavoriteChampions] = useState([]);
  const [summoner, setSummoner] = useState(null); 

  const refreshAccessToken = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/token", {}, {
        withCredentials: true, 
      });
      const newAccessToken = response.data.accessToken;
      Cookies.set("accessToken", newAccessToken, { expires: 1 / 24 / 4 }); 
      return newAccessToken;
    } catch (error) {
      console.error("Error refreshing access token:", error);
      return null;
    }
  };

  const fetchUserProfile = async () => {
    let token = Cookies.get("accessToken");

    try {
      const response = await axios.get("http://localhost:5000/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      setUser(response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log("Access token expired, trying to refresh...");
        token = await refreshAccessToken();
        if (token) {
          fetchUserProfile();
        } else {
          console.error("Failed to refresh token, logging out...");
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          window.location.href = "/login";
        }
      } else {
        console.error("Error fetching user profile:", error);
      }
    }
  };

  const fetchFavoriteChampions = async () => {
    let token = Cookies.get("accessToken");

    try {
      const response = await axios.get("http://localhost:5000/api/favorite-champions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      setFavoriteChampions(response.data);
    } catch (error) {
      console.error("Error fetching favorite champions:", error);
    }
  };

  const fetchSummoner = async () => {
    let token = Cookies.get("accessToken");

    try {
        const response = await axios.get("/api/user/summoner", {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
        });

        console.log("Summoner data received from API:", response.data); 
        setSummoner(response.data);
    } catch (error) {
        console.error("Error fetching summoner:", error);
    }
};


  useEffect(() => {
    fetchUserProfile();
    fetchFavoriteChampions();
    fetchSummoner(); 
  }, []);

  return (
    <div>
      {user ? (
        <div className="main_container">
          <h2>{user.username}'s Profile</h2>
          {user.profileImage && (
            <img
              src={`http://localhost:5000${user.profileImage}`}
              alt="Profile"
              width="100"
            />
          )}

          <div style={{ marginTop: "20px", color: "#A0C4FF" }}>
          <h3>Linked Summoner</h3>
          {summoner && summoner.gameName ? (
          <div>
            <p><strong>{summoner.gameName}#{summoner.tagLine}</strong></p>
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
