import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

const PrivateRoute = ({ children }) => {
  const name = Cookies.get('username');
  
    if (name == '') {
      return <Navigate to="/" />;
    }
  
    return children;
};

export default PrivateRoute;
