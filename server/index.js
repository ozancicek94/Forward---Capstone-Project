// Import modules here

const {
  client,
  createTables,
  createUser,
  createCity,
  createCourt,
  createFavoriteCourts,
  createSport,
  createScheduledEvents,
  createReview,
  fetchUsers,
  fetchCities,
  fetchSports,
  fetchCourts,
  fetchCourtById,
  fetchScheduledEvents,
  fetchFavoriteCourts,
  fetchUserReviews,
  fetchCourtReviews,
  deleteFavoriteCourts,
  deleteScheduledEvents,
  authenticate,
  findUserByToken,
  createNewUser
} = require('./db');
const express = require('express');
const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors()); 
// app.use(cors())
//For deployment only

const path = require('path');
// app.get('/', (req, res)=> res.sendFile(path.join(__dirname, '../client/dist/index.html')));
// app.use('/assets', express.static(path.join(__dirname, '../client/dist/assets'))); 

// Create the middleware function called isLoggedIn

const isLoggedIn = async(req,res,next) => {

  try{

    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
      const error = Error('Token missing');
      error.status = 401;
      throw error;
    };


    console.log('Authorization Header:', req.headers.authorization); 
    console.log('Token Extracted:', token);

    req.user = await findUserByToken(token);
    next();

  } catch(error){next(error)};

};

// Create the middleware for Cross-Origin Resource Sharing

// app.use(cors()); 
// app.use(express.json());

// API routes here

app.post('/api/auth/register', async(req, res, next)=> {
  try {
    res.send(await createNewUser(req.body));
  }
  catch(ex){
    next(ex);
  }
});

app.post('/api/auth/login', async(req, res, next)=> {
  try {
    res.send(await authenticate(req.body));
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/auth/me', isLoggedIn, (req, res, next)=> {
  try {
    res.send(req.user);
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/cities', async(req, res, next)=> {
  try {
    res.send(await fetchCities());
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/users', async(req, res, next)=> {
  try {
    res.send(await fetchUsers());
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/sports', async(req, res, next)=> {
  try {
    res.send(await fetchSports());
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/courts', async(req, res, next)=> {
  try {
    res.send(await fetchCourts());
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/courts/:id', isLoggedIn, async (req, res, next) => {
  try {
    const courtId = req.params.id;
    const court = await fetchCourtById(courtId);
    
    if (!court) {
      const error = new Error('Court not found');
      error.status = 404;
      throw error;
    }

    res.send(court);
  } catch (ex) {
    next(ex);
  }
});

app.get('/api/users/:id/favCourts', isLoggedIn, async(req, res, next)=> {
  try {
    if(req.params.id !== req.user.id){
      const error = Error('not authorized');
      error.Status = 401;
      throw error;
    }
    res.send(await fetchFavoriteCourts(req.params.id));
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/users/:id/schedEvents', isLoggedIn, async(req, res, next)=> {
  try {
    

    if(req.params.id !== req.user.id){
      const error = Error('not authorized');
      error.Status = 401;
      throw error;
    }
    res.send(await fetchScheduledEvents(req.params.id));
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/users/:id/userReviews', isLoggedIn, async (req, res, next) => {
  try {

    if (req.params.id !== req.user.id) {
      const error = Error('not authorized');
      error.Status = 401;
      throw error;
    }

    const reviews = await fetchUserReviews(req.params.id);
    console.log('Fetched reviews:', reviews); // Log the fetched reviews

    res.send(reviews);
  } catch (ex) {
    next(ex);
  }
});

app.get('/api/courts/:id/courtReviews', async (req, res, next) => {
  try {
    console.log(`Fetching reviews for court ID: ${req.params.id}`);

    const courtReviews = await fetchCourtReviews(req.params.id);
    console.log('Fetched court reviews:', courtReviews); // Log the fetched reviews

    res.send(courtReviews);
  } catch (ex) {
    next(ex);
  }
});

app.delete('/api/users/:userId/favCourts/:id', isLoggedIn, async(req, res, next)=> {
  try {
    if(req.params.userId !== req.user.id){
      const error = Error('not authorized');
      error.status = 401;
      throw error;
    }
    await deleteFavoriteCourts({ user_id: req.params.userId, id: req.params.id });
    res.sendStatus(204);
  }
  catch(ex){
    next(ex);
  }
});

app.delete('/api/users/:userId/schedEvents/:id',isLoggedIn, async(req, res, next)=> {
  try {
    if(req.params.userId !== req.user.id){
      const error = Error('not authorized');
      error.status = 401;
      throw error;
    }
    await deleteScheduledEvents({ user_id: req.params.userId, id: req.params.id });
    res.sendStatus(204);
  }
  catch(ex){
    next(ex);
  }
});

app.post('/api/users/:id/favCourts', isLoggedIn, async (req, res, next) => {
  try {
    // Ensure the logged-in user matches the user ID in the request URL
    if (req.params.id !== req.user.id) {
      const error = Error('Not authorized');
      error.status = 401;
      throw error;
    }

    // Use req.user.id instead of req.body.user_id because it's authenticated
    const { court_id } = req.body;

    // Ensure court_id is provided in the request body
    if (!court_id) {
      const error = new Error('Missing court_id');
      error.status = 400;
      throw error;
    }

    // Create the favorite court entry
    const favoriteCourt = await createFavoriteCourts({ user_id: req.user.id, court_id });
    res.status(201).send(favoriteCourt);
  } catch (ex) {
    next(ex);
  }
});

app.post('/api/users/:userId/schedEvents', isLoggedIn, async (req, res, next) => {
  try {
    // Ensure the logged-in user is the same as the user in the URL
    if (String(req.params.userId) !== req.user.id) {
      const error = new Error('Not authorized');
      error.status = 401;
      throw error;
    };

    // Get dateTime and court_id from request body
    const { dateTime, court_id } = req.body;

    if (!dateTime || !court_id) {
      const error = new Error('Missing dateTime or court_id');
      error.status = 400;
      throw error;
    }

    // Create the scheduled event
    const scheduledEvent = await createScheduledEvents({
      dateTime,
      user_id: req.user.id, // Use the user ID from the URL
      court_id
    });

    res.status(201).send(scheduledEvent);
  } catch (ex) {
    next(ex);
  }
});

app.post('/api/courts/:courtId/reviews', isLoggedIn, async (req, res, next) => {
  try {
    const { review, rating } = req.body;
    const { courtId } = req.params;
    
    if (!review || rating == null) {
      const error = new Error('Review and rating are required');
      error.status = 400;
      throw error;
    }

    const newReview = await createReview({
      review,
      rating,
      user_id: req.user.id, // Get the logged-in user's ID from the token
      court_id: courtId,
    });

    res.status(201).send(newReview);
  } catch (error) {
    next(error);
  }
});

app.patch('/api/courts/:id', isLoggedIn, async(req,res,next) => {
  try{
    const courtId = req.params.id;
    const{rating, review} = req.body;

    if (rating == null || !review) {
      const error = new Error('Rating and review are required');
      error.status = 400;
      throw error
    };

    const SQL = `
    UPDATE courts
    SET rating=$1, review=$2
    WHERE id=$3
    RETURNING *
    `;

    const response = await client.query(SQL, [rating, review, courtId]);

    if(response.rows.lenght === 0) {
      const error = new Error('Court not found');
      error.status = 404;
      throw error;
    };

    res.status(200).send(response.rows[0]);

  } catch(error){next(error)}
})

app.use((err, req, res, next)=> {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message || err });
});

//  Create the Init function here

const init = async()=> {
  console.log('connecting to database');
  await client.connect();
  console.log('connected to database');
  await createTables();
  console.log('tables created');
  const [Ozan, Mariana, Elif, Sevki, NewYork, LosAngeles, Ankara, Istanbul, RioDeJaneiro, SaoPaolo, Basketball, Soccer, Tennis, Running, Swimming] = await Promise.all([

    createUser({ username: 'ozancicek', password: 's3cr3t', name:'Ozan Cicek', email:'ozancicek94@gmail.com', photoURL:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbju39W8E3JMIT-1BkJOEkA7BSU1OJem9VVA&s'}),
    createUser({ username: 'marianacurti', password: 's3cr3t', name:'Mariana Curti', email:'mariana_curti@hotmail.com', photoURL:'https://media.licdn.com/dms/image/D5603AQGZt8Z-gs2VIQ/profile-displayphoto-shrink_200_200/0/1685572174842?e=2147483647&v=beta&t=CRjWdBy6tFo_ZPspbymDvKQkXpguR79ql3gSnuYquA4'}),
    createUser({ username: 'elifcicek', password: 's3cr3t', name:'Elif Cicek', email:'serpilelifcicek@gmail.com', photoURL:'https://www.tedu.edu.tr/sites/default/files/2023-01/web-tr_9.jpg'}),
    createUser({ username: 'sevkitopcu', password: 's3cr3t', name:'Sevki Topcu', email:'topcu.sevki@gmail.com', photoURL:'https://media.licdn.com/dms/image/C4E03AQELBo_Etz5mIA/profile-displayphoto-shrink_400_400/0/1562633133796?e=2147483647&v=beta&t=0BMK2o3ARp2Ln5e9vn4Q3uqYp6BLvvTXNZaVLMRcejo'}),
    
    createCity({ name: 'New York'}),
    createCity({ name: 'Los Angeles'}),
    createCity({ name: 'Ankara'}),
    createCity({ name: 'Istanbul'}),
    createCity({ name: 'Rio de Janeiro'}),
    createCity({ name: 'Sao Paolo'}),

    createSport({ name: 'Basketball'}),
    createSport({ name: 'Soccer'}),
    createSport({ name: 'Tennis'}),
    createSport({ name: 'Running'}),
    createSport({ name: 'Swimming'}),

  ]);

  console.log(await fetchUsers());
  console.log(await fetchCities());

  const [CanalStreet, Gertrude, ChelseaPiers, Corporal] = await Promise.all([

    createCourt({ name: 'Canal Street Basketball Courts', googleMapsLink: 'https://maps.app.goo.gl/kBchnbN4X2XKXys6A', neighborhood:'West Village', publicOrPrivate:'Public',indoorOrOutdoor:'Outdoor', rating: 4, review: 'The court has great views of Hudson River.', photoURL:'https://hudsonriverpark.org/app/uploads/2012/03/Activities-HRPK-Basketball-Canal-Featured-1151x1440-1.jpg', city_id: NewYork.id}),
    createCourt({ name: 'Dr. Gertrude B. Kelly Playground', googleMapsLink: 'https://maps.app.goo.gl/jb82VLXSzZiADNgP7', neighborhood:'Chelsea', publicOrPrivate:'Public',indoorOrOutdoor:'Outdoor', rating: 3, review: 'Small court, closes at 8.30 pm.', photoURL:'https://livingnewdeal.org/wp-content/uploads/2016/08/8-ave-17th-street-Dr-Gertrude-B-Kelly-Playground-LT-2.jpg', city_id: NewYork.id}),
    createCourt({ name: 'Chelsea Piers Fitness Courts', googleMapsLink: 'https://maps.app.goo.gl/ei5u5G7je2R7pTDp6', neighborhood:'Chelsea', publicOrPrivate:'Private',indoorOrOutdoor:'Indoor', rating: 5, review: 'Great court with great views.', photoURL:'https://i.pinimg.com/564x/ce/73/5f/ce735f0852e22014a24d2313bac585f5.jpg', city_id: NewYork.id}),
    createCourt({ name: 'Corporal John A. Seravalli Playground', googleMapsLink: 'https://maps.app.goo.gl/gdmzwPnBTThySVzy7', neighborhood:'Chelsea', publicOrPrivate:'Public',indoorOrOutdoor:'Outdoor', rating: 2, review: 'The hoops are not in good condition.', photoURL:'https://upload.wikimedia.org/wikipedia/commons/9/91/Seravalli_Playground_td_%282019-01-08%29_20.jpg', city_id: NewYork.id}),
    
  ]);

  const favCourts = await Promise.all([

    createFavoriteCourts({ user_id: Ozan.id, court_id: ChelseaPiers.id}),
    createFavoriteCourts({ user_id: Ozan.id, court_id: CanalStreet.id}),
    createFavoriteCourts({ user_id: Mariana.id, court_id: ChelseaPiers.id}),
    createFavoriteCourts({ user_id: Sevki.id, court_id: CanalStreet.id})
    
  ]);

  const schedEvents = await Promise.all([

    createScheduledEvents({ dateTime: '10.20.2024 @ 1:00 pm', user_id: Ozan.id, court_id: ChelseaPiers.id}),
    createScheduledEvents({ dateTime: '10.25.2024 @ 5:00 pm', user_id: Ozan.id, court_id: ChelseaPiers.id}),
    createScheduledEvents({ dateTime: '10.17.2024 @ 4:00 pm', user_id: Mariana.id, court_id: ChelseaPiers.id}),
    createScheduledEvents({ dateTime: '10.12.2024 @ 7:00 pm', user_id: Sevki.id, court_id: ChelseaPiers.id})
    
  ]);

  const reviewsSeedData = await Promise.all([

    createReview({ review: 'Great court but the people are toxic', rating: 4, user_id: Ozan.id, court_id: ChelseaPiers.id}),
    createReview({ review: 'Great views but it is too windy and the ball flies in the air', rating: 3, user_id: Ozan.id, court_id: CanalStreet.id}),
    createReview({ review: 'The hoop is good but they close the park too early', rating: 2, user_id: Ozan.id, court_id: Gertrude.id}),
    createReview({ review: 'I do not even like basketball', rating: 2, user_id: Mariana.id, court_id: ChelseaPiers.id}),
    createReview({ review: 'At least the view is nice here while Ozan is playing', rating: 4, user_id: Mariana.id, court_id: CanalStreet.id}),
    createReview({ review: 'Basketball is such a lame sport, where is the boxing gym', rating: 1, user_id: Sevki.id, court_id: Corporal.id}),
    createReview({ review: 'This place is great, but I do not like basketball', rating: 2, user_id: Sevki.id, court_id: ChelseaPiers.id}),
    
    
  ]);

  // console.log(await fetchUserSkills(moe.id));
  // await deleteUserSkill({ user_id: moe.id, id: userSkills[0].id});
  // console.log(await fetchUserSkills(moe.id));

  console.log('data seeded');

  const port = process.env.PORT || 3000;
  app.listen(port, ()=> console.log(`listening on port ${port}`));

};

// Call the init function

init();
