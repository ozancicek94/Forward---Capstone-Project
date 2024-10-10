import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import openingLogo from '../assets/OpeningLogo.svg';
import cityLogo from '../assets/WorldIcon.svg';  // Example logo for "City"
import sportLogo from '../assets/BasketBallBigIcon.svg'; // Example logo for "Sport"

// The opening logo component with animation
const OpeningPage = ({ onAnimationEnd }) => {
  const [animate, setAnimate] = useState(false);
  const [animateEnd, setAnimateEnd] = useState(false);

  useEffect(() => {
    const fadeInTimer = setTimeout(() => {
      setAnimate(true);
    }, 100);

    const fadeOutTimer = setTimeout(() => {
      setAnimateEnd(true);
    }, 1500); 

    const homepageTimer = setTimeout(() => {
      onAnimationEnd();
    }, 2500); 

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(homepageTimer);
    };
  }, [onAnimationEnd]);

  return (
    <div className={`logo-container ${animate ? 'animate' : ''} ${animateEnd ? 'animate-end' : ''}`}>
      <img className="openingLogo" src={openingLogo} alt="Logo" />
    </div>
  );
};

// Main app component with homepage divided into two sections
const OpeningPageApp = () => {
  const [showHomePage, setShowHomePage] = useState(false);
  const [homePageVisible, setHomePageVisible] = useState(false);
  const [cities, setCities] = useState([]);  // State for storing cities
  const [sports, setSports] = useState([]);  // State for storing sports
  const [selectedCity, setSelectedCity] = useState('');  // To track selected city
  const [selectedSport, setSelectedSport] = useState(''); // To track selected sport

  const navigate = useNavigate();  // Hook to navigate to another route

  // Fetch cities from backend API
  const fetchCities = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/cities');
      const data = await response.json();
      console.log('Fetched Cities:', data);
      setCities(data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  // Fetch sports from backend API
  const fetchSports = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/sports');
      const data = await response.json();
      console.log('Fetched Sports:', data);
      setSports(data);
    } catch (error) {
      console.error('Error fetching sports:', error);
    }
  };

  useEffect(() => {
    // Fetch cities and sports when component mounts
    fetchCities();
    fetchSports();
  }, []);

  const handleAnimationEnd = () => {
    setShowHomePage(true);
    setTimeout(() => {
      setHomePageVisible(true); 
    }, 500); 
  };

  const handleFindCourts = () => {
    // Navigate to the '/courts' route when button is clicked
    navigate('/courts');
  };

  return (
    <div
      className="App"
      style={{
        backgroundColor: 'white',  // Ensure the background stays white for the opening and homepage
        minHeight: '100vh',  // Ensure it covers the full height of the viewport
      }}
    >
      {!showHomePage && <OpeningPage onAnimationEnd={handleAnimationEnd} />}
      {showHomePage && (
        <div className={`home-page ${homePageVisible ? 'fade-in' : ''}`}>
          <div className="homepage-content">
            {/* Two sections - City and Sport */}
            <div className="section city-section">
              <h2>City</h2>
              <select 
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">Select a City</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
              <img src={cityLogo} alt="City Logo" className="logo" />
            </div>
            <div className="section sport-section">
              <h2>Sport</h2>
              <select 
                value={selectedSport} 
                onChange={(e) => setSelectedSport(e.target.value)}
              >
                <option value="">Select a Sport</option>
                {sports.map(sport => (
                  <option key={sport.id} value={sport.id}>{sport.name}</option>
                ))}
              </select>
              <img src={sportLogo} alt="Sport Logo" className="logo" />
            </div>
          </div>
          {/* Find Courts Button */}
          <div className="find-courts-button">
            <button onClick={handleFindCourts}>
              Find Courts
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpeningPageApp;