const express = require('express');
const router = express.Router();
const RevenueCost = require('../models/RevenueCost'); // MongoDB Model

// Create revenue or cost entry
router.post('/add', async (req, res) => {
  try {
    const { type, amount, description, date } = req.body;
    const entry = new RevenueCost({ type, amount, description, date });
    await entry.save();
    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all revenue and cost entries
router.get('/', async (req, res) => {
  try {
    const entries = await RevenueCost.find();
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;