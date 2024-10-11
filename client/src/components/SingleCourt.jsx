/* TODO - add your code to create a functional React component that renders details for a single court. Fetch the court data from the provided API. You may consider conditionally rendering a 'ScheduleEvent' button for logged in users. */
import { useState, useEffect } from "react";
import {useParams, useNavigate} from "react-router-dom";
import logo from '../assets/ForwardLogo.svg';
import topLogo from '../assets/Foward_GotoHomapageLogo.svg';
import basketballLogo from '../assets/BasketballIcon.svg';
import schedEventsIcon from '../assets/schedEventsIcon.svg';

export default function SingleCourt () {

  const {id} = useParams();
  const [court, setCourt] = useState(null);
  const [message, setMessage] = useState("");
  const [dateTime, setDateTime] = useState(""); 
  const [rating, setRating] = useState(null); 
  const [review, setReview] = useState(""); 
  const [favoriteCourts, setFavoriteCourts] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

  useEffect(()=> {

    const fetchSingleCourt = async() => {
      try{
        const token = localStorage.getItem("token"); 
        console.log("Token is here", token);

        const request = await fetch(`https://forward-capstone-project.onrender.com/api/courts/${id}`, {
          headers:{
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        });
        if (!request.ok) {
          throw new Error('Court not found');
        };
        const response = await request.json();

        console.log("Fetched single court is here:", response);

        setCourt(response);
        setRating(response.rating || ''); // Set rating after court is fetched
        setReview(response.review || '');

        // Fetch the user's favorite courts
        const userRequest = await fetch("https://forward-capstone-project.onrender.com/api/auth/me", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = await userRequest.json();

        const favCourtsResponse = await fetch(
          `https://forward-capstone-project.onrender.com/api/users/${userData.id}/favCourts`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const favCourtsData = await favCourtsResponse.json();
        setFavoriteCourts(favCourtsData);

        // Check if the current court is already in the favorites list
        const isCourtFavorite = favCourtsData.some((favCourt) => favCourt.id === response.id);
        setIsFavorite(isCourtFavorite);
      } catch(error) {console.error("Error fetching single court!", error )}
    };
    fetchSingleCourt();
  }, [id]);

  const handleScheduleEvent = async() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Please log in to schedule event this in this court!");
      return;
    };

    if (!dateTime) {
      setMessage("Please enter a date and time for the event!");
      return;
    };

    const userId = localStorage.getItem("id");

    try{

      const userRequest = await fetch('https://forward-capstone-project.onrender.com/api/auth/me', {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,  // Send the token in the header
        },
      });
  
      if (!userRequest.ok) {
        throw new Error('Unable to fetch user data');
      }
  
      const userData = await userRequest.json();
      const userId = userData.id;
      console.log("User for schedevent is here", userData);

      const request = await fetch(`https://forward-capstone-project.onrender.com/api/users/${userId}/schedEvents`, {
        method:"POST",
        headers:{
          "Content-Type": "application/json",
          Authorization:`Bearer ${token}`
        },
        body: JSON.stringify({
          dateTime, 
          court_id:court.id
        })
      });
      const response = await request.json();
      if (request.ok) {
        setMessage("You have successfully scheduled an event in this court!");
        ;
      } else {
        setMessage(response.error || "Failed to schedule and event the court.")
      }
    } catch(error) {console.error(error);
      setMessage("An error occured while scheduling an event in this court.")
    }
  };

  const handleUpdate = async() => {

    const token = localStorage.getItem("token");

    if(!token) {
      setMessage("Please log in to update court's rating and review");
      return
    }

    try{
      const request = await fetch(`https://forward-capstone-project.onrender.com/api/courts/${court.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization:`Bearer ${token}`
        },
        body: JSON.stringify({
          rating,
          review
        })
      });

      const response = await request.json();

      if(request.ok) {
        setCourt((prevCourt) => ({
          ...prevCourt,
          rating: response.rating,
          review: response.review,
        }));
        setMessage("Court information updated successfully")
      } else {
        setMessage(response.error || "Failed to update court information")
      }
    } catch(error) {
      console.error("Error updating court information", error);
      setMessage ("And error occured while updating court information")
    }

  };

  const handleAddToFavorites = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please log in to add this court to your favorites.");
      return;
    }

    try {
      const userRequest = await fetch("https://forward-capstone-project.onrender.com/api/auth/me", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userRequest.ok) {
        throw new Error("Unable to fetch user data");
      }

      const userData = await userRequest.json();
      const userId = userData.id;

      const response = await fetch(`https://forward-capstone-project.onrender.com/api/users/${userId}/favCourts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ court_id: court.id }),
      });

      if (response.ok) {
        setMessage("Court added to your favorite courts!");
        setIsFavorite(true);
      } else {
        setMessage("Failed to add the court to your favorites.");
      }
    } catch (error) {
      console.error("Error adding court to favorites", error);
      setMessage("An error occurred while adding this court to your favorites.");
    }
  };

  if (!court) return <div>Loading...</div>;

  return (
    <div>

      <img onClick={() => {navigate(`/Courts`)}} className="topLogo" src={topLogo} alt="Logo" />
      <img className="bigCityImage" src={`/assets/BigNYImage_02.jpg`} alt="City Image" />
      <img className="leftLogo" src={logo} alt="Logo" />
      <div className="courtList"> 
      <img className="BasketballIcon" src={basketballLogo} alt="Logo" />

      <div className="courtContent">
      <div className="courtLeft">
      
      <h2>{court.name}</h2>
      <img className="singleCourtImage" src={court.photourl}/>
      <p className="ratingReviewText">Rating: {court.rating}</p>
      <p>Review: {court.review}</p>
      <p className="loginLabel">Updating Rating and Review</p>
      <input className="loginInput"
      type="number"
      value={rating}
      onChange={(e) => {setRating(e.target.value)}}
      placeholder="Enter new rating"
      />
      <textarea
      className="loginInput"
      value={review}
      onChange={(e) => {setReview(e.target.value)}}
      placeholder="Enter new Rating"
      />
      <button onClick={handleUpdate}>Update Rating and Review</button>

      {/* Add to Favorites Button */}
      {/* Conditionally render the Add to Favorites button */}
      {!isFavorite && (
        <button onClick={handleAddToFavorites}>Add to My Favorite Courts</button>
      )}

      <div className="singleCourtSchedEvent">

      <img className="schedEventsSingleCourt" src={schedEventsIcon} alt="Logo" />
      
      <input
        className="schedEventInput"
        type="text"
        value={dateTime}
        onChange={(e) => setDateTime(e.target.value)}
        placeholder="Enter event date and time"
      />
      <button onClick={handleScheduleEvent}>Schedule Event</button>

      </div>
     
      </div>
      <div className="courtRight">
      <p>
        <a href={court.googlemapslink} target="_blank" rel="noopener noreferrer">
          View on Google Maps
        </a>
      </p>
      <p>{court.neighborhood}</p>
      <p>{court.publicorprivate}</p>
      <p>{court.indoororoutdoor}</p>
      
    </div>
    </div>
    </div>
    </div>
  )
}