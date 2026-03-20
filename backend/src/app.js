require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('../config/db');
const authRoutes = require('../routes/auth');
const userRoutes = require('../routes/user');
const classRoutes = require('../routes/class');
const coursesRoutes = require('../routes/courses');
const centerRoutes = require('../routes/center');
const userCenterRoutes = require('../routes/userCenter');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

// Cấu hình CORS cho phép frontend localhost:5173 truy cập
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true // Cho phép gửi cookie/token
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/class', classRoutes);
app.use('/courses', coursesRoutes);
app.use('/center', centerRoutes);
app.use('/user-center', userCenterRoutes);
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
