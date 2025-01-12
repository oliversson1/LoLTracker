import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function TournamentPage() {
  const [tournaments, setTournaments] = useState([]);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const username = Cookies.get('username');

  const api = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true,
  });

  useEffect(() => {
    fetchTournaments();
  }, []);
  console.log('Tournament data:', tournaments);


  const fetchTournaments = () => {
    api.get('/api/tournaments')
      .then(response => {
        console.log('Fetched tournaments:', response.data); 
        setTournaments(response.data);
      })
      .catch(error => {
        console.error('Error fetching tournaments:', error);
      });
  };
  

  const createTournament = () => {
    api.post('/api/tournaments', { name, date })
      .then(response => {
        setTournaments([...tournaments, response.data]);
        setName('');
        setDate('');
      })
      .catch(error => {
        alert('Error creating tournament: ' + error.response.data.error);
      });
  };


  const joinTournament = (tournamentId) => {
    api.post(`/api/tournaments/${tournamentId}/join`)
      .then(() => {
        alert('Joined tournament successfully!');
        fetchTournaments(); 
      })
      .catch(error => {
        alert('Error joining tournament: ' + error.response.data.error);
      });
  };


  const leaveTournament = (tournamentId) => {
    api.post(`/api/tournaments/${tournamentId}/leave`)
      .then(() => {
        alert('Left the tournament successfully!');
        fetchTournaments(); 
      })
      .catch(error => {
        alert('Error leaving tournament: ' + error.response.data.error);
      });
  };

  const deleteTournament = (tournamentId) => {
    api.delete(`/api/tournaments/${tournamentId}`)
      .then(() => {
        alert('Tournament deleted successfully!');
        fetchTournaments();
      })
      .catch(error => {
        alert('Error deleting tournament: ' + error.response.data.error);
      });
  };

  return (
    <div>
      <h1>Tournaments</h1>

      <div>
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
        <button onClick={createTournament}>Create Tournament</button>
      </div>


      <h2>Available Tournaments</h2>
      <ul>
        {tournaments.length === 0 ? (
          <li>No tournaments available</li>
        ) : (
          tournaments.map((tournament) => (
            <li key={tournament.id}>
              <strong>{tournament.name}</strong> - {tournament.status} ({new Date(tournament.date).toLocaleDateString()})
              <span> | Participants: {tournament.participants.length}</span>


              {username ? (
                tournament.participants.some(p => p.user.username === username) ? (
                  <button onClick={() => leaveTournament(tournament.id)}>Leave</button>
                ) : (
                  <button onClick={() => joinTournament(tournament.id)}>Join</button>
                )
              ) : (
                <button disabled>Login to join</button>
              )}

              {tournament.creator.username === username && (
                <button onClick={() => deleteTournament(tournament.id)}>Delete</button>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
