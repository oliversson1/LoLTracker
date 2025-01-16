
import React, { useState, useEffect } from "react";

export default function Users () {
  const [users, setUsers] = useState([]);

  console.log("Rendering AdminUsers component");

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched users:", data);
        setUsers(data);
      } else {
        console.error("Failed to fetch users");
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h1>Admin Panel - User Management</h1>
      <ul>
        {users
          .filter((user) => user.role !== 'admin') 
          .map((user) => (
            <li key={user.id}>
              {user.username} - {user.role}
              <button onClick={() => handleDelete(user.id)}>Delete</button>
            </li>
          ))}
      </ul>
    </div>
  );
};
