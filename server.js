const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

const testJWTRouter = require('./controllers/test-jwt');
const usersRouter = require('./controllers/users');
const profilesRouter = require('./controllers/profiles');
const tripsRouter = require('./controllers/trips');
const logEntriesRouter = require('./controllers/logEntries');
const commentsRouter = require('./controllers/comments');
const photosRouter = require('./controllers/photos'); 


const app = express();

mongoose.connect(process.env.MONGODB_URI, );

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
});

app.use(cors());
app.use(express.json());

// Routes go here
app.use('/test-jwt', testJWTRouter);
app.use('/users', usersRouter);
app.use('/profiles', profilesRouter);
app.use('/trips', tripsRouter);
app.use('/logEntries', logEntriesRouter);
app.use('/comments', commentsRouter); 
app.use('/photos', photosRouter);

app.listen(3000, () => {
  console.log('The express app is ready!');
});
