// Import packages here

const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgresql://forward_database_user:TdcVnCXdaglBWZzoeUBqr6KRFwjWCLkC@dpg-cs47nmtsvqrc7386u9g0-a.ohio-postgres.render.com/forward_database?ssl=true');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT = process.env.JWT || 'shhh';

// Create tables here

const createTables = async()=> {
  const SQL = `

    DROP TABLE IF EXISTS scheduled_events CASCADE;
    DROP TABLE IF EXISTS favorite_courts CASCADE;
    DROP TABLE IF EXISTS reviews CASCADE;
    DROP TABLE IF EXISTS comments CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS cities CASCADE;
    DROP TABLE IF EXISTS sports CASCADE;
    DROP TABLE IF EXISTS courts CASCADE;

    CREATE TABLE users(
      id UUID PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      photoURL VARCHAR(255) 
    );

    CREATE TABLE cities(
      id UUID PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE
    );

    CREATE TABLE sports(
      id UUID PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE
    );

     CREATE TABLE courts(
      id UUID PRIMARY KEY,
      name VARCHAR(500) NOT NULL,
      googleMapsLink VARCHAR(1000) NOT NULL UNIQUE,
      neighborhood VARCHAR(1000) NOT NULL,
      publicOrPrivate VARCHAR(1000) NOT NULL,
      indoorOrOutdoor VARCHAR(1000) NOT NULL,
      rating INTEGER NOT NULL,
      review VARCHAR(1000) NOT NULL,
      photoURL VARCHAR(255),
      city_id UUID REFERENCES cities(id) NOT NULL
    );

    CREATE TABLE favorite_courts(
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) NOT NULL,
      court_id UUID REFERENCES courts(id) NOT NULL
      
    );

     CREATE TABLE scheduled_events(
      id UUID PRIMARY KEY,
      dateTime VARCHAR(1000) NOT NULL,
      user_id UUID REFERENCES users(id) NOT NULL,
      court_id UUID REFERENCES courts(id) NOT NULL
      
    );

    CREATE TABLE reviews(
  id UUID PRIMARY KEY,
  review VARCHAR(10000) NOT NULL,
  rating INTEGER NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  court_id UUID REFERENCES courts(id) NOT NULL,
  CONSTRAINT user_court_unique UNIQUE (user_id, court_id)  -- Add unique constraint here
);

CREATE TABLE comments (
  id UUID PRIMARY KEY,
  comment TEXT NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  review_id UUID REFERENCES reviews(id) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

    
  `;
  await client.query(SQL);

};

// Create user, cities, sports, courts, favorite courts, scheduled events here

const createUser = async({ username, password, name, email, photoURL })=> {
  const SQL = `
    INSERT INTO users(id, username, password, name, email, photoURL) VALUES($1, $2, $3, $4, $5, $6) RETURNING *
  `;
  const response = await client.query(SQL, [ uuid.v4(), username, await bcrypt.hash(password, 5), name, email, photoURL]);
  return response.rows[0];
};

const createCity = async({ name })=> {
  const SQL = `
    INSERT INTO cities(id, name) VALUES ($1, $2) RETURNING * 
  `;
  const response = await client.query(SQL, [ uuid.v4(), name]);
  return response.rows[0];
};

const createSport = async({ name })=> {
  const SQL = `
    INSERT INTO sports(id, name) VALUES ($1, $2) RETURNING * 
  `;
  const response = await client.query(SQL, [ uuid.v4(), name]);
  return response.rows[0];
};

const createCourt = async({ name, googleMapsLink, neighborhood, publicOrPrivate, indoorOrOutdoor, rating, review, photoURL, city_id})=> {
  const SQL = `
    INSERT INTO courts(id, name, googleMapsLink, neighborhood, publicOrPrivate, indoorOrOutdoor, rating, review, photoURL, city_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING * 
  `;
  const response = await client.query(SQL, [ uuid.v4(), name, googleMapsLink, neighborhood, publicOrPrivate, indoorOrOutdoor, rating, review, photoURL, city_id]);
  return response.rows[0];
};

const createFavoriteCourts = async({ user_id, court_id })=> {
  const SQL = `
    INSERT INTO favorite_courts(id, user_id, court_id) VALUES ($1, $2, $3) RETURNING * 
  `;
  const response = await client.query(SQL, [ uuid.v4(), user_id, court_id]);
  return response.rows[0];
};

const createScheduledEvents = async({ dateTime, user_id, court_id })=> {
  const SQL = `
    INSERT INTO scheduled_events(id, dateTime, user_id, court_id) VALUES ($1, $2, $3, $4) RETURNING * 
  `;
  const response = await client.query(SQL, [ uuid.v4(), dateTime, user_id, court_id]);
  return response.rows[0];
};

const createReview = async({ review, rating, user_id, court_id })=> {
  const SQL = `
    INSERT INTO reviews(id, review, rating, user_id, court_id) VALUES ($1, $2, $3, $4, $5) RETURNING * 
  `;
  const response = await client.query(SQL, [ uuid.v4(), review, rating, user_id, court_id]);
  return response.rows[0];
};

const createComment = async ({ comment, user_id, review_id }) => {
  const SQL = `
    INSERT INTO comments(id, comment, user_id, review_id, created_at) 
    VALUES ($1, $2, $3, $4, NOW()) 
    RETURNING *;
  `;
  const response = await client.query(SQL, [uuid.v4(), comment, user_id, review_id]);
  return response.rows[0];
};

// Authenticate function here

const authenticate = async({ username, password })=> {
  const SQL = `
    SELECT id, password
    FROM users
    WHERE username = $1
  `;
  const response = await client.query(SQL, [ username ]);
  if(!response.rows.length || (await bcrypt.compare(password, response.rows[0].password)===false)){
    const error = Error('not authorized');
    error.status = 401;
    throw error;
  }
  const token = await jwt.sign({id:response.rows[0].id}, JWT);
  console.log(token);
  return {token};
};

// Register function here: createNewUser

const createNewUser = async({ username, password, name, email, photoURL }) => {

  const SQL = `
    SELECT id, password
    FROM users
    WHERE username = $1
  `;
  const response = await client.query(SQL, [ username ]);

  if(response.rows.length) {

    const error = Error('username exists, please use another');
    error.status = 401;
    throw error;
  }; 

  const user = await createUser({ username, password, name, email, photoURL });

  const token = await jwt.sign({id:user.id}, JWT);
  console.log(token);
  return {token};

};

// Create methods for fetching users, cities, sports, courts, favorite courts, scheduled events here


const fetchUsers = async()=> {
  const SQL = `
    SELECT id, username 
    FROM users
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchCities = async()=> {
  const SQL = `
    SELECT *
    FROM cities
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchSports = async()=> {
  const SQL = `
    SELECT *
    FROM sports
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchCourts = async()=> {
  const SQL = `
    SELECT *
    FROM courts
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchCourtById = async(id) => {

  const SQL = `
  SELECT * FROM courts
  WHERE id = $1
  `;

  const response = await client.query(SQL, [id])

  return response.rows[0];
}

const fetchFavoriteCourts = async(user_id)=> {
  const SQL = `
    SELECT courts.*, favorite_courts.id as fav_id 
    FROM favorite_courts
    JOIN courts ON favorite_courts.court_id = courts.id
    WHERE favorite_courts.user_id = $1
  `;
  const response = await client.query(SQL, [ user_id ]);
  return response.rows;
};

const fetchScheduledEvents = async(user_id)=> {
  const SQL = `
    SELECT scheduled_events.*, courts.name as court_name, courts.photoURL as court_photo, courts.neighborhood as court_neighborhood
    FROM scheduled_events
    JOIN courts ON scheduled_events.court_id = courts.id
    WHERE scheduled_events.user_id = $1
  `;
  const response = await client.query(SQL, [ user_id ]);
  return response.rows;
};

const fetchUserReviews = async(user_id)=> {
  
  const SQL = `
    SELECT reviews.*, courts.name as court_name, courts.photoURL as court_photo, courts.neighborhood as court_neighborhood
    FROM reviews
    JOIN courts ON reviews.court_id = courts.id
    WHERE reviews.user_id = $1
  `;
  const response = await client.query(SQL, [ user_id ]);
  return response.rows;
};

const fetchCourtReviews = async(court_id) => {
  const SQL = `
    SELECT 
      reviews.*, 
      courts.name AS court_name, 
      courts.photoURL AS court_photo, 
      courts.neighborhood AS court_neighborhood, 
      users.name AS user_name, 
      users.photoURL AS user_photo
    FROM reviews
    JOIN courts ON reviews.court_id = courts.id
    JOIN users ON reviews.user_id = users.id
    WHERE reviews.court_id = $1
  `;
  const response = await client.query(SQL, [court_id]);
  return response.rows;
};

const getReviewById = async (reviewId) => {
  try {
    const SQL = `
      SELECT * FROM reviews
      WHERE id = $1
    `;
    const response = await client.query(SQL, [reviewId]);

    // Return the review if found
    if (response.rows.length === 0) {
      throw new Error("Review not found");
    }

    return response.rows[0];
  } catch (error) {
    console.error('Error fetching review by ID:', error);
    throw error;
  }
};

const fetchCommentsByReviewId = async (review_id) => {
  const SQL = `
    SELECT comments.*, users.username, users.photourl
    FROM comments
    JOIN users ON comments.user_id = users.id
    WHERE review_id = $1
    ORDER BY created_at DESC;
  `;
  const response = await client.query(SQL, [review_id]);
  return response.rows;
};

// Create a method to update a user's review for a court

const updateReview = async ({review, rating,reviewId }) => {
  const SQL = `
    UPDATE reviews
    SET review = $1, rating = $2
    WHERE id = $3
    RETURNING *;
  `;
  const response = await client.query(SQL, [review, rating, reviewId]);
  return response.rows[0];
};

// Create methods to delete Favorite Courts and Scheduled Events

const deleteFavoriteCourts = async({user_id, id})=> {
  const SQL = `
    DELETE
    FROM favorite_courts
    WHERE user_id = $1 AND id = $2
  `;
  await client.query(SQL, [ user_id, id ]);
};

const deleteScheduledEvents = async({user_id, id})=> {
  const SQL = `
    DELETE
    FROM scheduled_events
    WHERE user_id = $1 AND id = $2
  `;
  await client.query(SQL, [ user_id, id ]);
};

const deleteReview = async ({reviewId}) => {
  const SQL = `
    DELETE FROM reviews
    WHERE id = $1;
  `;
  await client.query(SQL, [reviewId]);
};

const deleteComment = async ({ user_id, id }) => {
  const SQL = `
    DELETE FROM comments 
    WHERE user_id = $1 AND id = $2;
  `;
  await client.query(SQL, [user_id, id]);
};

// Create the calculateAverageRating function:

const calculateAverageRating = async (courtId) => {
  const result = await client.query(`
    SELECT AVG(rating) as average_rating
    FROM reviews
    WHERE court_id = $1
  `, [courtId]);

  // Ensure you return a rounded value to 1 decimal place.
  const averageRating = result.rows[0].average_rating;
  return Math.round(averageRating * 10) / 10; // Round to one decimal place
};

// Create the findUserByToken for the isLoggedin middleware function

const findUserByToken = async(token) => {

  let id;
  try{
    const payload = await jwt.verify(token, JWT);
    id = payload.id;
    console.log('Decoded Token Payload:', payload); 

  } catch(ex){
    const error = Error('not authorized');
      error.status = 401;
      throw error;
    
  }
  const SQL = `
    SELECT id, username, name, photourl
    FROM users
    WHERE id = $1
  `;
  const response = await client.query(SQL, [id]);
  if(!response.rows.length){
    const error = Error('not authorized');
    error.status = 401;
    throw error;
  }
  return response.rows[0];

};

// Export the modules

module.exports = {
  client,
  createTables,
  createUser,
  createCity,
  createCourt,
  createFavoriteCourts,
  createSport,
  createScheduledEvents,
  createReview,
  createComment,
  fetchFavoriteCourts,
  fetchUsers,
  fetchCities,
  fetchSports,
  fetchCourts,
  fetchCourtById,
  fetchScheduledEvents,
  fetchUserReviews,
  fetchCourtReviews,
  fetchCommentsByReviewId,
  getReviewById,
  updateReview,
  deleteFavoriteCourts,
  deleteScheduledEvents,
  deleteReview,
  deleteComment,
  calculateAverageRating,
  authenticate,
  findUserByToken,
  createNewUser
};
