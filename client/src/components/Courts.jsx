import React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from '../assets/ForwardLogo.svg';
import topLogo from '../assets/Foward_GotoHomapageLogo.svg';
import basketballLogo from '../assets/BasketballIcon.svg';


export default function Courts () {
  const [courts, setCourts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCourts, setFilteredCourts] = useState([]);
  const token = localStorage.getItem("token");
  const [logOutRefresh, setLogOutRefresh] = useState(false);

  useEffect(()=> {

    const fetchAllCourts = async() => {

      try{

      const request = await fetch("http://localhost:3000/api/courts");
      const response = await request.json();
      console.log("Courts are here!", response);

      setCourts(response);
      setFilteredCourts(response);

      } catch (error) {console.error("Error fetching the court list!",error)}
      

    };

    fetchAllCourts();

  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);

    if(e.target.value === "") {
      setFilteredCourts(courts);
    } else {
      const filtered = courts.filter(court => 
        court.name.toUpperCase().includes(e.target.value.toUpperCase()) ||
        court.neighborhood.toUpperCase().includes(e.target.value.toUpperCase())
      );
      setFilteredCourts(filtered);
      console.log("filtered Courts are here:", filtered);
    }
  };

  const handleLogout = () => {
    const token = localStorage.getItem("token");
    localStorage.removeItem("token");
    setLogOutRefresh(true);
  }

  return (
    <div className="blue-page">
      <img onClick={() => {navigate(`/`)}} className="topLogo" src={topLogo} alt="Logo" />
      <img className="bigCityImage" src={`public/assets/bigNYImage_02.jpg`} alt="City Image" />
      <img className="leftLogo" src={logo} alt="Logo" />
      <div className="courtList"> 
      <img className="BasketballIcon" src={basketballLogo} alt="Logo" />
      <h1>Courts</h1>
      <input className="searchCourtsInput"
      type="text"
      placeholder="Search by name or neighborhood..."
      value={searchQuery}
      onChange={handleSearch}/>
    <ul>
      {filteredCourts.map(court => (
        <li className="courtItem" key={court.id}>
          <img className="courtListImages" src={court.photourl}/>
          <div className="courtDetails">
          <h2>{court.name}</h2>
          <p className="courtInfo">{court.neighborhood}</p>
          <div className="buttonWrapper">
          <Link to={`/Courts/${court.id}`}>
          <button className="courtInfo">See Details</button></Link>
          </div>
          </div>
          </li>
      ))}

    </ul>
    </div>
    {(token) && <button className="logoutButton" type="text" onClick={handleLogout}>Log out</button>}
    </div>
  )
}