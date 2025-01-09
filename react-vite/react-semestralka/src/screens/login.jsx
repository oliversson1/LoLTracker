import React, { useState } from "react";

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
  });
  const [message, setMessage] = useState("");

  const toggleForm = () => {
    setIsRegistering((prev) => !prev);
    setFormData({ username: "", password: "", email: "" });
    setMessage("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Loading...");

    try {
      const endpoint = isRegistering ? "/api/register" : "/api/login";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          isRegistering
            ? "Registration successful! You can now log in."
            : "Login successful!"
        );
        if (!isRegistering) {
          // Save the token or perform further actions after login
          console.log("Token:", data.token);
        }
      } else {
        setMessage(data.error || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", textAlign: "center" }}>
      <h1>{isRegistering ? "Register" : "Login"}</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
            required
            style={{ width: "100%", padding: "10px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
            style={{ width: "100%", padding: "10px" }}
          />
        </div>
        {isRegistering && (
          <div style={{ marginBottom: "10px" }}>
            <input
              type="email"
              name="email"
              placeholder="Email (optional)"
              value={formData.email}
              onChange={handleInputChange}
              style={{ width: "100%", padding: "10px" }}
            />
          </div>
        )}
        <button type="submit" style={{ width: "100%", padding: "10px" }}>
          {isRegistering ? "Register" : "Login"}
        </button>
      </form>
      <p style={{ marginTop: "10px" }}>{message}</p>
      <button
        onClick={toggleForm}
        style={{
          background: "none",
          border: "none",
          color: "blue",
          cursor: "pointer",
          marginTop: "10px",
        }}
      >
        {isRegistering ? "Already have an account? Login" : "No account? Register"}
      </button>
    </div>
  );
}
