import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../Loading/Loading';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Wait for auth to finish loading before making a decision
  if (loading) {
    return <Loading />;
  }

  // If not loading and no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, show the protected content
  return children;
};

export default PrivateRoute;

