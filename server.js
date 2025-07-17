require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const fileRoutes = require('./routes/fileRoutes');
const researchRoutes = require('./routes/researchRoutes');
const activityRoutes = require('./routes/activityRoutes');



// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://chemflow.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'src'))); // Your frontend lives in src/
app.use('/api/files', fileRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/research', researchRoutes);
app.use('/api/activity', activityRoutes);








// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');
const logRoutes = require('./routes/logs');
const personalDBRoutes = require('./routes/personalDBRoutes');


app.use('/api/auth', authRoutes);
app.use('/api/user', dataRoutes);   // protected user route
app.use('/api/guest', dataRoutes);  // guest route
app.use('/api/logs', logRoutes); 
app.use('/api/personaldb', personalDBRoutes);



// Health check (optional)
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});



// Error handler (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
