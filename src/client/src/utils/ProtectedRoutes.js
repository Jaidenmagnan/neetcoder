import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { getMe } from './Auth';

const ProtectedRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading state
  
  useEffect(() => {
    const checkAuth = async () => {
      const userData = await getMe();
      setIsAuthenticated(!!userData); 
    };
    
    checkAuth();
  }, []);
  
  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return <div>Loading...</div>; 
  }
  
  // Once we know auth status, either show protected content or redirect
  return isAuthenticated ? <Outlet /> : <Navigate to="/sign-in" />;
};

export default ProtectedRoutes;