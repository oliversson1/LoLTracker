import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const AdminRoute = ({ children }) => {
  const userRole = Cookies.get('role');

  if (userRole !== 'admin') {
    return <Navigate to="/login" />;
  }

  return children;
};

export default AdminRoute;
