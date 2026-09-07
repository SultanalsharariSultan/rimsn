const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Emergency = require('./emergencyModel');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rimsnfl';

app.get('/', (req, res) => {
  res.send('rimsn offline mesh server is running with DB support');
});

// مسار لإرسال إشارة استغاثة جديدة وحفظها
app.post('/api/emergency', async (req, res) => {
  try {
    const { senderId, latitude, longitude, message } = req.body;
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

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}

startServer();