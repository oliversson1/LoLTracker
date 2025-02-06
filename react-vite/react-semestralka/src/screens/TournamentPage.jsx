import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function TournamentPage() {
  const [tournaments, setTournaments] = useState([]);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); 
  const username = Cookies.get('username');

  const api = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true,
  });

  useEffect(() => {
    fetchTournaments();
  }, []);

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000); 
  };

  const fetchTournaments = () => {
    api.get('/api/tournaments')
      .then(response => {
        setTournaments(response.data);
      })
      .catch(error => {
        console.error('Error fetching tournaments:', error);
        showMessage('Error fetching tournaments.', 'error');
      });
  };

  const createTournament = () => {
    api.post('/api/tournaments', { name, date })
      .then(response => {
        fetchTournaments(); 
        setName('');
        setDate('');
        showMessage('Tournament created successfully!', 'success');
      })
      .catch(error => {
        console.error("Create tournament error:", error);

        if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          const errorMessages = error.response.data.errors.map(err => err.message).join("\n");
          showMessage(errorMessages, 'error');
        } else {
          showMessage('Error creating tournament: ' + (error.response?.data?.error || error.message), 'error');
        }
      });
  };

  const joinTournament = (tournamentId) => {
    api.post(`/api/tournaments/${tournamentId}/join`)
      .then(() => {
        fetchTournaments();
        showMessage('Joined tournament successfully!', 'success');
      })
      .catch(error => {
        console.error("Join tournament error:", error);
        showMessage('Error joining tournament: ' + (error.response?.data?.error || error.message), 'error');
      });
  };

  const leaveTournament = (tournamentId) => {
    api.delete(`/api/tournaments/${tournamentId}/leave`)
      .then(() => {
        fetchTournaments();
        showMessage('Left the tournament successfully!', 'success');
      })
      .catch(error => {
        console.error("Leave tournament error:", error);
        showMessage('Error leaving tournament: ' + (error.response?.data?.error || error.message), 'error');
      });
  };

  const deleteTournament = (tournamentId) => {
    api.delete(`/api/tournaments/${tournamentId}`)
      .then(() => {
        fetchTournaments();
        showMessage('Tournament deleted successfully!', 'success');
      })
      .catch(error => {
        console.error("Delete tournament error:", error);
        showMessage('Error deleting tournament: ' + (error.response?.data?.error || error.message), 'error');
      });
  };

  return (
    <div className="tournament-container">
      <h1>Tournaments</h1>

      {message && <div className={`message-box ${messageType}`}>{message}</div>}

      <div className="create-tournament">
        <h2>Create a Tournament</h2>
        <input
          type="text"
          placeholder="Tournament Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button onClick={createTournament} disabled={!name || !date}>
          Create Tournament
        </button>
      </div>

      <div className="tournament-list">
        <h2>Available Tournaments</h2>
        <ul>
          {tournaments.length === 0 ? (
            <li>No tournaments available</li>
          ) : (
            tournaments.map((tournament) => (
              <li key={tournament.id} className="tournament-item">
                <div className="tournament-info">
                  <strong>{tournament.name}</strong> - {tournament.status} ({new Date(tournament.date).toLocaleDateString()})
                  <span> | Participants: {tournament.participants?.length ?? 0}</span>
                </div>

                <div className="tournament-actions">
                
                  {username ? (
                    tournament.participants?.some(p => p.user?.username === username) ? (
                      <button className="leave-btn" onClick={() => leaveTournament(tournament.id)}>Leave</button>
                    ) : (
                      <button className="join-btn" onClick={() => joinTournament(tournament.id)}>Join</button>
                    )
                  ) : (
                    <button className="login-required-btn" disabled>Login to join</button>
                  )}

                    {tournament.creator?.username === username && (
                    <button className="delete-btn" onClick={() => deleteTournament(tournament.id)}>Delete</button>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
