const express = require('express');
const cors = require('cors');
const { protect } = require('./middleware/auth');
const app = express();

const cookieParser = require('cookie-parser');

// Middleware setup
app.use(cors({
  origin: [process.env.ALLOWED_ORIGN_LOCAL, process.env.ALLOWED_ORIGN_PROD],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const notiRoutes = require('./routes/notificationRoutes')

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', protect, taskRoutes);
app.use('/api/users', protect, userRoutes);
app.use('/api/notifications', protect, notiRoutes);

module.exports = app; 
