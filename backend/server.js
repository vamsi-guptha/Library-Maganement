const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const seedData = require('./seed');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const seatRoutes = require('./routes/seatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'API is running' }));

const PORT = process.env.PORT || 5001;

// Seed data
seedData();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
