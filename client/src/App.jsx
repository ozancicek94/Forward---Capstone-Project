import { useState, useEffect } from 'react';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Courts from "./components/Courts";
import SingleCourt from "./components/SingleCourt";
import Login from "./components/Login";
import Register from "./components/Register";
import Account from "./components/Account";
import Navigations from './components/Navigations';
import OpeningPageApp from './components/OpeningPage';

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);  // Start as logged out
  const [loading, setLoading] = useState(true);  // Loading state to prevent early rendering

  // Check for token on initial page load
  useEffect(() => {
    const token = localStorage.getItem('token');  // Fetch token from localStorage
    if (token) {
      setIsLoggedIn(true);  // If a valid token is found, log in
    } else {
      setIsLoggedIn(false);  // No token, set logged out
    }
    setLoading(false);  // Once token is checked, stop loading
  }, []);

  // Show a loading screen while checking token
  if (loading) {
    return <div>Loading...</div>;  // Optional: Replace with a spinner or a better loading UI
  }

  return (
    <div>
      {/* Pass the isLoggedIn state to the navbar */}
      <Navigations isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        <Route path='/' element={<OpeningPageApp />} />
        <Route path='/Courts' element={<Courts />} />
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
