import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FavoriteChampionsPage() {
  const [champions, setChampions] = useState([]); 
  const [selectedChampion, setSelectedChampion] = useState('');
  const [favoriteChampions, setFavoriteChampions] = useState([]); 
  const [editChampion, setEditChampion] = useState(null); 
  const [editNote, setEditNote] = useState(''); 

  useEffect(() => {
    axios
      .get('https://ddragon.leagueoflegends.com/cdn/13.21.1/data/en_US/champion.json')
      .then(response => {
        const championsList = Object.values(response.data.data);
        setChampions(championsList);
      })
      .catch(error => {
        console.error('Error fetching champions:', error);
      });
  }, []);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/favorite-champions')
      .then(response => {
        setFavoriteChampions(response.data);
      })
      .catch(error => {
        console.error('Error fetching favorite champions:', error);
      });
  }, []);

  const addFavoriteChampion = () => {
    const champion = champions.find(champ => champ.id === selectedChampion);
    if (!champion) return;
    const exists = favoriteChampions.some(champ => champ.id === champion.id);
    if (exists) {
      alert(`${champion.name} je už v zozname obľúbených!`);
      return;
    }
  
    axios
      .post('http://localhost:5000/api/favorite-champions', {
        name: champion.name,
        role: champion.tags[0],
      })
      .then(response => {
        setFavoriteChampions([...favoriteChampions, response.data]);
        setSelectedChampion('');
      })
      .catch(error => {
        alert('Error adding favorite champion: ' + error.message);
      });
  };
  
  
  const deleteChampion = (id) => {
    axios
      .delete(`http://localhost:5000/api/favorite-champions/${id}`)
      .then(() => {
        setFavoriteChampions(favoriteChampions.filter((champ) => champ.id !== id));
      })
      .catch(error => console.error('Error deleting champion:', error));
  };

  const saveEdit = (id) => {
    axios
      .put(`http://localhost:5000/api/favorite-champions/${id}`, { note: editNote })
      .then(() => {
        setFavoriteChampions(
          favoriteChampions.map(champ => 
            champ.id === id ? { ...champ, note: editNote } : champ
          )
        );
        setEditChampion(null);
        setEditNote('');
      })
      .catch(error => {
        alert('Error updating champion: ' + error.message);
      });
  };
  

  return (
    <div className="favorite-champions-container">
      <h1>Favorite Champions</h1>
  
      <div className="add-favorite">
        <h2>Choose a champion</h2>
        <select
          value={selectedChampion}
          onChange={(e) => setSelectedChampion(e.target.value)}
        >
          <option value="">Choose a champion</option>
          {champions.map(champion => (
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
            <li>You have no favorite champions</li>
          ) : (
            favoriteChampions.map(champ => (
              <li key={champ.id} className="champion-item">
                {editChampion === champ.id ? (
                  <div>
                    <input
                      type="text"
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      placeholder="Zadajte poznámku"
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
                      <button onClick={() => {
                        setEditChampion(champ.id);
                        setEditNote(champ.note || '');
                      }}>Edit</button>
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

export default FavoriteChampionsPage;
