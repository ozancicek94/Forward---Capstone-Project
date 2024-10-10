import { useState } from 'react';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Courts from "./components/Courts";
import SingleCourt from "./components/SingleCourt";
import Login from "./components/Login";
import Register from "./components/Register";
import Account from "./components/Account";
import Navigations from './components/Navigations';
import OpeningPageApp from './components/OpeningPage';

function AppContent() {
  const location = useLocation();

  // Check if we are on the opening page
  const isOpeningPage = location.pathname === '/';

  return (
    <div className={isOpeningPage ? 'opening-page' : 'blue-page'}>
      <Navigations />
      <Routes>
        <Route path='/' element={<OpeningPageApp />} />
        <Route path='/Courts' element={<Courts />} />
        <Route path='/courts/:id' element={<SingleCourt />} />
        <Route path='/LogIn' element={<Login />} />
        <Route path='/Register' element={<Register />} />
        <Route path='/Account' element={<Account />} />
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
