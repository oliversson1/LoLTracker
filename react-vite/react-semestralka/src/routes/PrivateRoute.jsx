import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const PrivateRoute = ({ children }) => {
  const userRole = Cookies.get('role');

  if (userRole !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
