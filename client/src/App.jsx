import { useState, useEffect } from 'react';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Courts from "./components/Courts";
import SingleCourt from "./components/SingleCourt";
import Login from "./components/Login";
import Register from "./components/Register";
import Account from "./components/Account";
import Navigations from './components/Navigations';
import OpeningPageApp from './components/OpeningPage";

function AppContent() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);  // Loading state

  // Check if we are on the opening page
  const isOpeningPage = location.pathname === '/';

  // Check token on initial page load
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);  // Set logged in if token exists, otherwise logged out
    setLoading(false);  // Set loading to false after token check
  }, []);

  // Render loading spinner while checking token
  if (loading) {
    return <div>Loading...</div>;  // Replace with a loader if desired
  }

  return (
    <div className={isOpeningPage ? 'opening-page' : 'blue-page'}>
      <Navigations isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        {/* Opening Page */}
        <Route path='/' element={<OpeningPageApp />} />

        {/* Courts Page (available even if not logged in) */}
        <Route path='/Courts' element={<Courts />} />

        {/* Single Court Page (available only when logged in) */}
        <Route path='/courts/:id' element={isLoggedIn ? <SingleCourt /> : <Navigate to="/LogIn" />} />

        {/* Authentication Pages */}
        <Route path='/LogIn' element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path='/Register' element={<Register />} />

        {/* Account Page (protected route, redirect if not logged in) */}
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
