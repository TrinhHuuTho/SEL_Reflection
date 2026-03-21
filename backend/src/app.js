require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('../config/passport');
const connectDB = require('../config/db');
const authRoutes = require('../routes/auth');
const userRoutes = require('../routes/user');
const classRoutes = require('../routes/class');
const coursesRoutes = require('../routes/courses');
const centerRoutes = require('../routes/center');
const { startEmailWorker } = require('./emailWorker');

const app = express();
const PORT = process.env.PORT || 3000;

(async () => {
  await connectDB();
  startEmailWorker();

  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }));

  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, 
      maxAge: 24 * 60 * 60 * 1000 
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/auth', authRoutes);
  app.use('/user', userRoutes);
  app.use('/class', classRoutes);
  app.use('/courses', coursesRoutes);
  app.use('/center', centerRoutes);

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
  });
})();
