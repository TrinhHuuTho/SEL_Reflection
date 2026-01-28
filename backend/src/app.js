require('dotenv').config();
const express = require('express');
const connectDB = require('../config/db');
const routes = require('../routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
