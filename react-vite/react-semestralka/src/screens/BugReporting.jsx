import React, { useState } from "react";

const BugReporting = () => {
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const submitBug = async (e) => {
    e.preventDefault();
    if (!description) return;

    try {
      const response = await fetch("http://localhost:5000/api/bugs", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });

      if (response.ok) {
        setMessage("Bug reported successfully!");
        setDescription("");
      } else {
        setMessage("Error reporting bug.");
      }
    } catch (error) {
      console.error("Error reporting bug:", error);
      setMessage("Error reporting bug.");
    }
  };

  return (
    <div className="bug-reporting-container">
      <h2> 📜 Report a Bug</h2>
  
      {message && <p className="bug-message">{message}</p>} 
  
      <form className="bug-form" onSubmit={submitBug}>
        <textarea
          className="bug-input"
          placeholder="Describe the bug..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>
  
        <button className="bug-submit-btn" type="submit">Submit Bug</button>
      </form>
    </div>
  );
  
};

export default BugReporting;
