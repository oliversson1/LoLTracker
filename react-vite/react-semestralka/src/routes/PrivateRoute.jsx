import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      let token = Cookies.get("accessToken");

      if (!token) {
        try {
          const response = await axios.post("http://localhost:5000/api/token", {}, { withCredentials: true });
          token = response.data.accessToken;
          Cookies.set("accessToken", token, { expires: 1 / 24 / 4 }); 
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Error refreshing access token:", error);
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <p>Loading...</p>; 
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
