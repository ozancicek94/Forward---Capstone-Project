import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/ForwardLogo.svg';
import topLogo from '../assets/Foward_GotoHomapageLogo.svg';
import schedEventsIcon from '../assets/schedEventsIcon.svg';
import accountPagePhoto from '../assets/AccountPagePhoto.jpg';

export default function Account() {
  const [user, setUser] = useState(null); // Start as null until fetched
  const [scheduledEvents, setScheduledEvents] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [favoriteCourts, setFavoriteCourts] = useState([]);
  const [eventsDeleted, setEventsDeleted] = useState(false);
  const [favCourtDeleted, setFavCourtDeleted] = useState(false);
  const [reviewDeleted, setReviewDeleted] = useState(false);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const navigate = useNavigate();
  

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      try {
        // Fetch user data
        const userResponse = await fetch(`https://forward-capstone-project.onrender.com/api/auth/me`,{
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = await userResponse.json();
        setUser(userData);

        // Fetch user's scheduled events after user data is fetched
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

        // Fetch user's favorite courts
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

        // Fetch user's reviews after user data is fetched
        const reviewsResponse= await fetch(
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

        // Fetch comments for each review
        reviewsData.forEach(async (review) => {
          const commentsResponse = await fetch(`/api/reviews/${review.id}/comments`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const commentsData = await commentsResponse.json();
          setComments((prevComments) => ({
            ...prevComments,
            [review.id]: commentsData,
          }));
        });

      } catch (error) {
        console.error("Error fetching review data:", error);
      }
    };

    fetchData();
  }, [eventsDeleted, favCourtDeleted, reviewDeleted]); // Re-fetch if events are deleted

  const handleDelete = async (eventID) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `https://forward-capstone-project.onrender.com/api/users/${user.id}/schedEvents/${eventID}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setFavCourtDeleted(!favCourtDeleted); // Toggle state to re-fetch events
      } else {
        console.error("Error deleting event");
      }
    } catch (error) {
      console.error("Error in deletion:", error);
    }
  };

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
        setReviewDeleted(!reviewDeleted); // Toggle state to re-fetch reviews
      } else {
        console.error("Error deleting review");
      }
    } catch (error) {
      console.error("Error in deletion:", error);
    }
  };

  const handleFavDelete = async (favCourtId) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `https://forward-capstone-project.onrender.com/api/users/${user.id}/favCourts/${favCourtId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setFavCourtDeleted(!favCourtDeleted); // Toggle state to re-fetch events
      } else {
        console.error("Error deleting favorite court");
      }
    } catch (error) {
      console.error("Error in deletion:", error);
    }
  };

  const handleCommentSubmit = async (reviewId) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`/api/reviews/${reviewId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ comment: newComment })
      });
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const handleCommentDelete = async (commentId) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // Conditionally render user and events
  if (!user) {
    return <p>Loading user data...</p>;
  }

  return (
    <div>
      <img className="bigCityImage" src={accountPagePhoto} alt="City Image" />
      <img onClick={() => {navigate(`/Courts`)}} className="topLogo" src={topLogo} alt="Logo" />
      <img className="leftLogo" src={logo} alt="Logo" />
      <div className="courtList">
        <div className="accountPage">
          <div className="leftContent">
            <h1>{user.name}'s Account</h1>
  
            {/* Favorite Courts Section */}
            <div className="favCourts">
              <h2>Favorite Courts</h2>
              {favoriteCourts.length === 0 ? (
                <p>No favorite courts.</p>
              ) : (
                <ul>
                  {favoriteCourts.map((court) => (
                    <li key={court.fav_id}>
                      <h3>{court.name}</h3>
                      <img
                        src={court.photourl}
                        alt={court.name}
                        style={{ width: '200px', height: 'auto' }}
                      />
                      <p>{court.neighborhood}</p>
                      <Link to={`/Courts/${court.id}`}>
                        <button>See Details</button>
                      </Link>
                      <button
                        className="favCourtRemoveButton"
                        type="button"
                        onClick={() => handleFavDelete(court.fav_id)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
  
            {/* User's Reviews Section */}
            <div className="userReviews">
              <h2>User's Reviews</h2>
              {userReviews.length === 0 ? (
                <p>No reviews yet.</p>
              ) : (
                <ul>
                  {userReviews.map((review) => (
                    <li key={review.id}>
                      <h3>{review.court_name}</h3>
                      <img
                        src={review.court_photo}
                        alt={review.court_name}
                        style={{ width: '3em', height: 'auto' }}
                      />
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
  
                      {/* Comments Section */}
                      <h4>Comments</h4>
                      <ul>
                        {comments[review.id]?.map((comment) => (
                          <li key={comment.id}>
                            <p>{comment.username}: {comment.comment}</p>
                            {comment.user_id === user.id && (
                              <button onClick={() => handleCommentDelete(comment.id)}>
                                Delete
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
  
                      {/* Add Comment Input */}
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment"
                      />
                      <button onClick={() => handleCommentSubmit(review.id)}>
                        Submit Comment
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
  
          {/* Right Content - Scheduled Events */}
          <div className="rightContent">
            <img className="profilePhoto" src={user.photourl} alt={user.name} />
            <div className="schedEvents">
              <img className="schedEventsIcon" src={schedEventsIcon} alt="Logo" />
              <h2>Scheduled Events</h2>
              {scheduledEvents.length === 0 ? (
                <p>No scheduled events.</p>
              ) : (
                <ul>
                  {scheduledEvents.map((event) => (
                    <li key={event.id}>
                      <h2>{event.court_name}</h2>
                      <p>{event.court_neighborhood}</p>
                      <img
                        src={event.court_photo}
                        alt={event.court_name}
                        style={{ width: '200px', height: 'auto' }}
                      />
                      <p>{event.datetime}</p>
                      <button type="button" onClick={() => handleDelete(event.id)}>
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}