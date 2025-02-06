import React, { useState, useEffect } from "react";

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    image: null, 
  });
  const [message, setMessage] = useState({ text: "", type: "" });

  const toggleForm = () => {
    setIsRegistering((prev) => !prev);
    setFormData({ username: "", password: "", image: null });
    setMessage({ text: "", type: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] })); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "Loading...", type: "info" });
  
    try {
      let body;
      let headers;
  
      if (isRegistering) {
        body = new FormData();
        body.append("username", formData.username);
        body.append("password", formData.password);
        if (formData.image) {
          body.append("image", formData.image);
        }
        headers = {}; 
      } else {
        body = JSON.stringify({
          username: formData.username,
          password: formData.password,
        });
        headers = {
          "Content-Type": "application/json",
        };
      }
  
      const endpoint = isRegistering
        ? "http://localhost:5000/api/register"
        : "http://localhost:5000/api/login";
  
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers,
        body,
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
        console.error("Server response error:", data);
  
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map((err) => err.message).join("\n");
          setMessage({ text: errorMessages, type: "error" });
        } else {
          setMessage({ text: data.error || "Something went wrong.", type: "error" });
        }
      }
    } catch (error) {
      console.error("Error during submit:", error);
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
          {isRegistering && (
            <input
              className="find_txt"
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
            />
          )}
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