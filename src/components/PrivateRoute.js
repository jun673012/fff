// src/components/PrivateRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
    const isAuthenticated = !!localStorage.getItem('personId');

    return isAuthenticated ? children : <Navigate to="/login" />;
}

export default PrivateRoute;