import React, { useState, useEffect } from "react";

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" }); // text = hláška, type = 'success' | 'error'

  const toggleForm = () => {
    setIsRegistering((prev) => !prev);
    setFormData({ username: "", password: "" });
    setMessage({ text: "", type: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "Loading...", type: "info" });

    try {
      const endpoint = isRegistering
        ? "http://localhost:5000/api/register"
        : "http://localhost:5000/api/login";

      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          text: isRegistering
            ? "Registration successful! You can now log in."
            : "Login successful! Redirecting...",
          type: "success",
        });

        if (!isRegistering) {
          console.log("AccessToken:", data.accessToken);
          setTimeout(() => {
            window.location.href = "/";
          }, 2000);
        }
      } else {
        setMessage({ text: data.error || "Something went wrong.", type: "error" });
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: "An error occurred. Please try again.", type: "error" });
    }
  };

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="header_section_mp">
      <h1>{isRegistering ? "Register" : "Login"}</h1>

      {message.text && (
        <div
          style={{
            padding: "10px",
            color: message.type === "success" ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="input_container">
          <input
            className="find_txt"
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
          <input
            className="find_txt"
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>
        <button className="find_btn" type="submit">
          {isRegistering ? "Register" : "Login"}
        </button>
      </form>

      <button onClick={toggleForm} className="find_btn">
        {isRegistering ? "Already have an account? Login" : "No account? Register"}
      </button>
    </div>
  );
}
