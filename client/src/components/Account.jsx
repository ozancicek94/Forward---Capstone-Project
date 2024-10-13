import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/ForwardLogo.svg';
import topLogo from '../assets/Foward_GotoHomapageLogo.svg';
import schedEventsIcon from '../assets/schedEventsIcon.svg';
import accountPagePhoto from '../assets/AccountPagePhoto.jpg';

export default function Account() {
  const [user, setUser] = useState(null);
  const [scheduledEvents, setScheduledEvents] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [favoriteCourts, setFavoriteCourts] = useState([]);
  const [eventsDeleted, setEventsDeleted] = useState(false);
  const [favCourtDeleted, setFavCourtDeleted] = useState(false);
  const [reviewDeleted, setReviewDeleted] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      try {
        // Fetch user data
        const userResponse = await fetch(`https://forward-capstone-project.onrender.com/api/auth/me`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = await userResponse.json();
        setUser(userData);

        // Fetch scheduled events
        const eventsResponse = await fetch(
          `https://forward-capstone-project.onrender.com/api/users/${userData.id}/schedEvents`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            }
          }
        );
        const eventsData = await eventsResponse.json();
        setScheduledEvents(eventsData);

        // Fetch favorite courts
        const favCourtsResponse = await fetch(
          `https://forward-capstone-project.onrender.com/api/users/${userData.id}/favCourts`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            }
          }
        );
        const favCourtsData = await favCourtsResponse.json();
        setFavoriteCourts(favCourtsData);

        // Fetch user's reviews
        const reviewsResponse = await fetch(
          `https://forward-capstone-project.onrender.com/api/users/${userData.id}/userReviews`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            }
          }
        );
        const reviewsData = await reviewsResponse.json();
        setUserReviews(reviewsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [eventsDeleted, favCourtDeleted, reviewDeleted]); // Re-fetch if something is deleted

  // Handle review delete
  const handleReviewDelete = async (reviewID) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `https://forward-capstone-project.onrender.com/api/users/${user.id}/userReviews/${reviewID}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setReviewDeleted(!reviewDeleted); // Trigger a state change to re-fetch reviews
      } else {
        console.error("Error deleting review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  if (!user) {
    return <p>Loading user data...</p>;
  }

  return (
    <div>
      <img className="bigCityImage" src={accountPagePhoto} alt="City Image" />
      <img onClick={() => { navigate(`/Courts`) }} className="topLogo" src={topLogo} alt="Logo" />
      <img className="leftLogo" src={logo} alt="Logo" />
      <div className="courtList">
        <div className="accountPage">
          <div className="leftContent">
            <h1>{user.name}'s Account</h1>
            {/* Favorite Courts */}
            <div className="favCourts">
              <h2>Favorite Courts</h2>
              {favoriteCourts.length === 0 ? (
                <p>No favorite courts.</p>
              ) : (
                <ul>
                  {favoriteCourts.map((court) => (
                    <li key={court.fav_id}>
                      <h3>{court.name}</h3>
                      <img src={court.photourl} alt={court.name} style={{ width: '5em', height: 'auto' }} />
                      <p>{court.neighborhood}</p>
                      <Link to={`/Courts/${court.id}`}>
                        <button>See Details</button>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* User's Reviews */}
            <div className="userReviews">
              <h2>User's Reviews</h2>
              {userReviews.length === 0 ? (
                <p>No reviews yet.</p>
              ) : (
                <ul>
                  {userReviews.map((review) => (
                    <li key={review.id}>
                      <h3>{review.court_name}</h3>
                      <img src={review.court_photo} alt={review.court_name} style={{ width: '3em', height: 'auto' }} />
                      <p>{review.review}</p>
                      <p>{review.rating}</p>
                      <Link to={`/Courts/${review.court_id}`}>
                        <button>See Details</button>
                      </Link>
                      <button
                        className="favCourtRemoveButton"
                        type="button"
                        onClick={() => handleReviewDelete(review.id)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="rightContent">
            <img className="profilePhoto" src={user.photourl} alt={user.name} />
          </div>
        </div>
      </div>
    </div>
  );
}