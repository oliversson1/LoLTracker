import React, { useState, useEffect } from "react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [bugs, setBugs] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchBugs();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchBugs = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/bugs", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setBugs(data);
      }
    } catch (error) {
      console.error("Error fetching bugs:", error);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setUsers(users.filter((user) => user.id !== id));
      } else {
        alert("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const resolveBug = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/bugs/${id}/resolve`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      if (response.ok) {
        setBugs((prevBugs) =>
          prevBugs.map((bug) =>
            bug.id === id ? { ...bug, status: "resolved" } : bug
          )
        );
      }
    } catch (error) {
      console.error("Error resolving bug:", error);
    }
  };

  return (
    <div className="main_container">
      <h1>Admin Panel</h1>

      <h2>User Management</h2>
      <ul>
        {users
          .filter((user) => user.role !== "admin")
          .map((user) => (
            <li key={user.id}>
              {user.username} - {user.role}
              <button
                className="delete-button"
                onClick={() => handleDeleteUser(user.id)}
              >
                Delete
              </button>
            </li>
          ))}
      </ul>

      <div className="bug-overview">
        <h2>Bug Reports</h2>
        {bugs.length === 0 ? (
          <p className="no-bugs">No bugs reported.</p>
        ) : (
          <ul className="bug-list">
            {bugs.map((bug) => (
              <li key={bug.id} className={`bug-item ${bug.status}`}>
                <span>
                  <strong>Bug:</strong> {bug.description} |{" "}
                  <strong>Status:</strong> {bug.status}
                </span>
                {bug.status === "open" && (
                  <button
                    className="resolve-button"
                    onClick={() => resolveBug(bug.id)}
                  >
                    Mark as Resolved
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
