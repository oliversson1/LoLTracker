import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function FavoriteChampionsPage() {
  const [champions, setChampions] = useState([]);        
  const [selectedChampion, setSelectedChampion] = useState(''); 
  const [favoriteChampions, setFavoriteChampions] = useState([]); 
  const [editChampion, setEditChampion] = useState(null);  
  const [editNote, setEditNote] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); 

  const api = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true,
  });

  useEffect(() => {
    axios
      .get('https://ddragon.leagueoflegends.com/cdn/13.21.1/data/en_US/champion.json')
      .then((response) => {
        const championsList = Object.values(response.data.data);
        setChampions(championsList);
      })
      .catch((error) => {
        setErrorMessage('Error fetching champions from Data Dragon.');
        console.error('Error fetching champions:', error);
      });
  }, []);

  useEffect(() => {
    api
      .get('/api/favorite-champions')
      .then((response) => {
        setFavoriteChampions(response.data);
      })
      .catch((error) => {
        setErrorMessage('Error showing favorite champions. Make sure you are logged in.');
        console.error('Error fetching favorites:', error);
      });
  }, []);

  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 3000);  
  };

  const addFavoriteChampion = () => {
    const champion = champions.find((ch) => ch.id === selectedChampion);
    if (!champion) return;

    if (favoriteChampions.some((ch) => ch.name === champion.name)) {
      showError(`${champion.name} is already in your favorite list!`);
      return;
    }

    api.post('/api/favorite-champions', { name: champion.name, role: champion.tags[0] })
      .then((response) => {
        setFavoriteChampions([...favoriteChampions, response.data]);
        setSelectedChampion('');
      })
      .catch((error) => {
        showError('Error adding favorite champion.');
        console.error('Error adding favorite champion:', error);
      });
  };

  const deleteChampion = (championId) => {
    api.delete(`/api/favorite-champions/${championId}`)
      .then(() => {
        setFavoriteChampions((prev) => prev.filter((champ) => champ.id !== championId));
      })
      .catch((error) => {
        showError('Error deleting champion.');
        console.error('Error deleting champion:', error);
      });
  };

  const saveEdit = (championId) => {
    api.put(`/api/favorite-champions/${championId}`, { note: editNote })
      .then(() => {
        setFavoriteChampions((prev) =>
          prev.map((champ) =>
            champ.id === championId ? { ...champ, note: editNote } : champ
          )
        );
        setEditChampion(null);
        setEditNote('');
      })
      .catch((error) => {
        showError('Error updating champion.');
        console.error('Error updating champion:', error);
      });
  };

  return (
    <div className="favorite-champions-container">
      <h1>Favorite Champions</h1>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <div className="add-favorite">
        <h2>Select a champion</h2>
        <select
          value={selectedChampion}
          onChange={(e) => setSelectedChampion(e.target.value)}
        >
          <option value="">Choose a champion</option>
          {champions.map((champion) => (
            <option key={champion.id} value={champion.id}>
              {champion.name}
            </option>
          ))}
        </select>
        <button disabled={!selectedChampion} onClick={addFavoriteChampion}>
          Add to favorites
        </button>
      </div>

      <div className="favorite-list">
        <h2>Your favorite champions</h2>
        <ul>
          {favoriteChampions.length === 0 ? (
            <li>No favorite champions yet.</li>
          ) : (
            favoriteChampions.map((champ) => (
              <li key={champ.id} className="champion-item">
                {editChampion === champ.id ? (
                  <div>
                    <input
                      type="text"
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      placeholder="Add note"
                    />
                    <button onClick={() => saveEdit(champ.id)}>Save</button>
                  </div>
                ) : (
                  <div className="champion-info">
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/13.21.1/img/champion/${champ.name}.png`}
                      alt={champ.name}
                      className="champion-image"
                    />
                    <div>
                      <strong>{champ.name}</strong> - {champ.role}
                      {champ.note && <span> ({champ.note})</span>}
                    </div>
                    <div>
                      <button onClick={() => deleteChampion(champ.id)}>Delete</button>
                      <button
                        onClick={() => {
                          setEditChampion(champ.id);
                          setEditNote(champ.note || '');
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
