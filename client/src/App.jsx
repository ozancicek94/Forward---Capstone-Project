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

  // Check if we are on the opening page
  const isOpeningPage = location.pathname === '/';

  // Use effect to check token on page load
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false); // Ensure the user is logged out initially
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove the token
    setIsLoggedIn(false); // Update the logged-in state
  };

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
