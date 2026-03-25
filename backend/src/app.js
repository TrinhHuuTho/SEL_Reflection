require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('../config/passport');
const connectDB = require('../config/db');

// Routes
const authRoutes = require('../routes/auth');
const userRoutes = require('../routes/user');
const classRoutes = require('../routes/class');
const coursesRoutes = require('../routes/courses');
const centerRoutes = require('../routes/center');
const userCenterRoutes = require('../routes/userCenter');
const classMemberRoutes = require('../routes/classMember');
const nodeRoutes = require('../routes/node');
const reflectionRoutes = require('../routes/reflection');

// Worker
const { startEmailWorker } = require('./emailWorker');

const app = express();
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    // Kết nối DB
    await connectDB();

    // Start background worker
    startEmailWorker();

    // CORS
    app.use(cors({
      origin: 'http://localhost:5173',
      credentials: true
    }));

    // Session
    app.use(session({
      secret: process.env.SESSION_SECRET || 'your-session-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // production => true (https)
        maxAge: 24 * 60 * 60 * 1000
      }
    }));

    // Passport
    app.use(passport.initialize());
    app.use(passport.session());

    // Body parser
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Routes
    app.use('/auth', authRoutes);
    app.use('/user', userRoutes);
    app.use('/class', classRoutes);
    app.use('/courses', coursesRoutes);
    app.use('/center', centerRoutes);
    app.use('/user-center', userCenterRoutes);
    app.use('/class-member', classMemberRoutes);
    app.use('/nodes', nodeRoutes);
    app.use('/reflections', reflectionRoutes);

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/`);
    });

  } catch (error) {
    console.error('Error starting server:', error);
  }
})();