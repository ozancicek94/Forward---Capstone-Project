import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import logo from '../assets/ForwardLogo.svg';
import topLogo from '../assets/Foward_GotoHomapageLogo.svg';
import basketballLogo from '../assets/BasketballIcon.svg';
import schedEventsIcon from '../assets/schedEventsIcon.svg';
import bigCityImage from '../assets/BigNYImage_02.jpg';

export default function SingleCourt() {
  const { id } = useParams();
  const [court, setCourt] = useState(null);
  const [message, setMessage] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [rating, setRating] = useState(null);
  const [review, setReview] = useState("");
  const [favoriteCourts, setFavoriteCourts] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [courtReviews, setCourtReviews] = useState([]);
  const [newComments, setNewComments] = useState({});
  const [comments, setComments] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSingleCourt = async () => {
      try {
        const token = localStorage.getItem("token");
  
        const request = await fetch(`https://forward-capstone-project.onrender.com/api/courts/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        });
  
        if (!request.ok) throw new Error('Court not found');
  
        const response = await request.json();
        setCourt(response);
  
        // Fetch user data to get the user_id
        const userRequest = await fetch("https://forward-capstone-project.onrender.com/api/auth/me", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
  
        const userData = await userRequest.json();
        const userId = userData.id; // Ensure user_id is correctly fetched
  
        // Fetch favorite courts
        const favCourtsResponse = await fetch(
          `https://forward-capstone-project.onrender.com/api/users/${userId}/favCourts`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            }
          }
        );
  
        const favCourtsData = await favCourtsResponse.json();
        
        // Ensure favCourtsData is an array
        if (Array.isArray(favCourtsData)) {
          const isCourtFavorite = favCourtsData.some((favCourt) => favCourt.id === response.id);
          setIsFavorite(isCourtFavorite);
        } else {
          console.error("favCourtsData is not an array:", favCourtsData);
        }
  
        // Fetch court reviews
        const courtReviewsResponse = await fetch(
          `https://forward-capstone-project.onrender.com/api/courts/${response.id}/courtReviews`
        );
        const courtReviewsData = await courtReviewsResponse.json();
        setCourtReviews(courtReviewsData);
  
      } catch (error) {
        console.error("Error fetching court reviews!", error);
      }
    };
  
    fetchSingleCourt();
  }, [id]);

  useEffect(() => {
    if (court && court.id) {
      const fetchCourtReviewsAndComments = async () => {
        try {
          const courtReviewsResponse = await fetch(
            `https://forward-capstone-project.onrender.com/api/courts/${court.id}/courtReviews`
          );
          const courtReviewsData = await courtReviewsResponse.json();
          setCourtReviews(courtReviewsData);
  
          // Fetch comments for each review
          const commentsData = {};
          for (const review of courtReviewsData) {
            const commentsResponse = await fetch(
              `https://forward-capstone-project.onrender.com/api/reviews/${review.id}/comments`
            );
            const reviewComments = await commentsResponse.json();
            commentsData[review.id] = reviewComments;
          }
          setComments(commentsData);
        } catch (error) {
          console.error("Error fetching court reviews and comments!", error);
        }
      };
  
      fetchCourtReviewsAndComments();
    }
  }, [court]);

  // handleAddReview Function
  const handleAddReview = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please log in to add a review.");
      return;
    }

    if (!review || !rating) {
      setMessage("Please enter both review and rating.");
      return;
    }

    try {
      const response = await fetch(
        `https://forward-capstone-project.onrender.com/api/courts/${id}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ review, rating }),
        }
      );

      if (response.ok) {
        const updatedReviews = await fetch(
          `https://forward-capstone-project.onrender.com/api/courts/${id}/courtReviews`
        );
        const updatedReviewsData = await updatedReviews.json();
        setCourtReviews(updatedReviewsData); 
        setMessage("Review added successfully!");
        setReview(""); 
        setRating(null); 
      } else {
        const newReview = await response.json();
        setMessage(newReview.error || "Failed to add review.");
      }
    } catch (error) {
      console.error("Error adding review", error);
      setMessage("An error occurred while adding your review.");
    }
  };


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

  // const handleUpdate = async() => {

  //   const token = localStorage.getItem("token");

  //   if(!token) {
  //     setMessage("Please log in to update court's rating and review");
  //     return
  //   }

  //   try{
  //     const request = await fetch(`https://forward-capstone-project.onrender.com/api/courts/${court.id}`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization:`Bearer ${token}`
  //       },
  //       body: JSON.stringify({
  //         rating,
  //         review
  //       })
  //     });

  //     const response = await request.json();

  //     if(request.ok) {
  //       setCourt((prevCourt) => ({
  //         ...prevCourt,
  //         rating: response.rating,
  //         review: response.review,
  //       }));
  //       setMessage("Court information updated successfully")
  //     } else {
  //       setMessage(response.error || "Failed to update court information")
  //     }
  //   } catch(error) {
  //     console.error("Error updating court information", error);
  //     setMessage ("And error occured while updating court information")
  //   }

  // };

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

  // Add handleAddComments function

  const handleAddComment = async (reviewId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Please log in to add a comment.");
      return;
    }
  
    try {
      const response = await fetch(
        `https://forward-capstone-project.onrender.com/api/reviews/${reviewId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ comment: newComments[reviewId] || '' }),
        }
      );
  
      if (response.ok) {
        // Fetch updated comments for the specific review
        const updatedCommentsResponse = await fetch(
          `https://forward-capstone-project.onrender.com/api/reviews/${reviewId}/comments`
        );
        const updatedCommentsData = await updatedCommentsResponse.json();
  
        // Update the comments for that review
        setComments((prevComments) => ({
          ...prevComments,
          [reviewId]: updatedCommentsData,
        }));
  
        // Clear the new comment input
        setNewComments((prevComments) => ({ ...prevComments, [reviewId]: '' }));
        setMessage("Comment added successfully!");
      } else {
        setMessage("Failed to add comment.");
      }
    } catch (error) {
      console.error("Error adding comment", error);
      setMessage("An error occurred while adding your comment.");
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId, reviewId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Please log in to delete your comment.");
      return;
    }

    try {
      const response = await fetch(
        `https://forward-capstone-project.onrender.com/api/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const updatedComments = comments[reviewId].filter((comment) => comment.id !== commentId);
        setComments((prevComments) => ({
          ...prevComments,
          [reviewId]: updatedComments,
        }));
        setMessage("Comment deleted successfully!");
      } else {
        setMessage("Failed to delete comment.");
      }
    } catch (error) {
      console.error("Error deleting comment", error);
      setMessage("An error occurred while deleting your comment.");
    }
  };

  if (!court) return <div>Loading...</div>;

  return (
    <div>
      <img
        onClick={() => {
          navigate(`/Courts`);
        }}
        className="topLogo"
        src={topLogo}
        alt="Logo"
      />
      <img className="bigCityImage" src={bigCityImage} alt="City Image" />
      <img className="leftLogo" src={logo} alt="Logo" />
      <div className="courtList">
        <img className="BasketballIcon" src={basketballLogo} alt="Logo" />

        <div className="courtContent">
          <div className="courtLeft">
            <h2>{court.name}</h2>
            <img className="singleCourtImage" src={court.photourl} alt={court.name} />

            <div className="courtReviews">
              <h2>Court Reviews</h2>
              <ul>
                {courtReviews.map((review) => (
                  <li className="reviewItem" key={review.id}>
                    <img className="courtReviewImages" src={review.user_photo} alt={review.user_name} />
                    <div className="reviewDetails">
                      <h2 className="review">{review.review}</h2>
                      <p>{review.user_name}</p>
                      <h4>Comments</h4>
                      <ul>
  {(comments[review.id] || []).map((comment) => (
    <li key={comment.id}>
      <p>{comment.username}: {comment.comment}</p>
      {comment.user_id === localStorage.getItem("id") && (
        <button onClick={() => handleDeleteComment(comment.id, review.id)}>Delete</button>
      )}
    </li>
  ))}
</ul>
                      <textarea
                        className="loginInput"
                        value={newComments[review.id] || ''}
                        onChange={(e) => setNewComments({ ...newComments, [review.id]: e.target.value })}
                        placeholder="Add a comment"
                      />
                      <button onClick={() => handleAddComment(review.id)}>Add Comment</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {!isFavorite && (
              <button onClick={handleAddToFavorites}>
                Add to My Favorite Courts
              </button>
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
  );
}