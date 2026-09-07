const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const Emergency = require('./emergencyModel');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
let databaseConnection;

function connectToDatabase() {
  if (!MONGO_URI) {
    return Promise.reject(new Error('MONGO_URI is not configured'));
  }

  if (!databaseConnection) {
    databaseConnection = mongoose.connect(MONGO_URI).catch((error) => {
      databaseConnection = undefined;
      throw error;
    });
  }

  return databaseConnection;
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'rimsn offline mesh',
    databaseConfigured: Boolean(MONGO_URI),
    databaseState: mongoose.connection.readyState
  });
});

app.post('/api/emergency', async (req, res) => {
  try {
    const { senderId, latitude, longitude, message } = req.body;

    if (!senderId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        error: 'senderId, latitude, and longitude are required'
      });
    }

    await connectToDatabase();

    const newEmergency = new Emergency({
      senderId,
      latitude,
      longitude,
      message
    });
    await newEmergency.save();
    res.status(201).json({ success: true, message: 'Emergency signal broadcasted and saved locally' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;