require('dotenv').config();
const express = require('express');
const connectDB = require('../config/db');
const authRoutes = require('../routes/auth');
const userRoutes = require('../routes/user');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);
app.use('/user', userRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
