import { useState, useEffect } from 'react';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Courts from "./components/Courts";
import SingleCourt from "./components/SingleCourt";
import Login from "./components/Login";
import Register from "./components/Register";
import Account from "./components/Account";
import Navigations from './components/Navigations';
import OpeningPageApp from './components/OpeningPage';

function AppContent() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);  // New state for loading

  // Check if we are on the opening page
  const isOpeningPage = location.pathname === '/';

  // Check token on initial page load
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      // Optional: validate the token with the server here if necessary
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);  // If no token, consider the user logged out
    }
    
    setLoading(false);  // After checking the token, set loading to false
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove the token
    setIsLoggedIn(false);  // Set logged-in state to false
  };

  // Render loading spinner or initial screen while checking token
  if (loading) {
    return <div>Loading...</div>;  // Optionally replace with a loader or splash screen
  }

  return (
    <div className={isOpeningPage ? 'opening-page' : 'blue-page'}>
      <Navigations isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} handleLogout={handleLogout} />
      <Routes>
        <Route path='/' element={<OpeningPageApp />} />
        <Route path='/Courts' element={isLoggedIn ? <Courts /> : <Navigate to="/LogIn" />} />
        <Route path='/courts/:id' element={isLoggedIn ? <SingleCourt /> : <Navigate to="/LogIn" />} />
        <Route path='/LogIn' element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path='/Register' element={<Register />} />
        <Route path='/Account' element={isLoggedIn ? <Account /> : <Navigate to="/LogIn" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
