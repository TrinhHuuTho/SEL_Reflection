require('dotenv').config();
const express = require('express');
const connectDB = require('../config/db');
const authRoutes = require('../routes/auth');
const userRoutes = require('../routes/user');
const classRoutes = require('../routes/class');
const coursesRoutes = require('../routes/courses');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/class',classRoutes);
app.use('/courses', coursesRoutes);
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
