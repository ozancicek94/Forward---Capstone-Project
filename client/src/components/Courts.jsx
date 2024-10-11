import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from '../assets/ForwardLogo.svg';
import topLogo from '../assets/Foward_GotoHomapageLogo.svg';
import basketballLogo from '../assets/BasketballIcon.svg';

export default function Courts() {
  const [courts, setCourts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCourts, setFilteredCourts] = useState([]);
  const token = localStorage.getItem("token");
  const [logOutRefresh, setLogOutRefresh] = useState(false);
  const navigate = useNavigate(); // Add the navigate function

  useEffect(() => {
    const fetchAllCourts = async () => {
      try {
        const request = await fetch("https://forward-capstone-project.onrender.com/api/courts");
        const response = await request.json();
        console.log("Courts are here!", response);
        setCourts(response);
        setFilteredCourts(response);
      } catch (error) {
        console.error("Error fetching the court list!", error);
      }
    };
    fetchAllCourts();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);

    if (e.target.value === "") {
      setFilteredCourts(courts);
    } else {
      const filtered = courts.filter((court) =>
        court.name.toUpperCase().includes(e.target.value.toUpperCase()) ||
        court.neighborhood.toUpperCase().includes(e.target.value.toUpperCase())
      );
      setFilteredCourts(filtered);
      console.log("filtered Courts are here:", filtered);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLogOutRefresh(true);
  };

  const handleSeeDetails = (courtId) => {
    if (!token) {
      navigate("/login"); // Redirect to login if not logged in
    } else {
      navigate(`/Courts/${courtId}`); // Navigate to court details if logged in
    }
  };

  return (
    <div className="blue-page">
      <img onClick={() => { navigate(`/`) }} className="topLogo" src={topLogo} alt="Logo" />
      <img className="bigCityImage" src={`../assets/bigNYImage_02.jpg`} alt="City Image" />
      <img className="leftLogo" src={logo} alt="Logo" />
      <div className="courtList">
        <img className="BasketballIcon" src={basketballLogo} alt="Logo" />
        <h1>Courts</h1>
        <input
          className="searchCourtsInput"
          type="text"
          placeholder="Search by name or neighborhood..."
          value={searchQuery}
          onChange={handleSearch}
        />
        <ul>
          {filteredCourts.map((court) => (
            <li className="courtItem" key={court.id}>
              <img className="courtListImages" src={court.photourl} />
              <div className="courtDetails">
                <h2>{court.name}</h2>
                <p className="courtInfo">{court.neighborhood}</p>
                <div className="buttonWrapper">
                  <button
                    className="courtInfo"
                    onClick={() => handleSeeDetails(court.id)} // Handle click for "See Details"
                  >
                    See Details
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
    </div>
  );
}