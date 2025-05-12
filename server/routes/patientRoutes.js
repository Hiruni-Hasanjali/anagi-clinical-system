// routes/patientRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (id, email, role) => {
  return jwt.sign(
    { id, email, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @route   POST /api/patients/register
// @desc    Register a new patient
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone
    } = req.body;

    // Check if patient already exists
    const patientExists = await Patient.findOne({ email });

    if (patientExists) {
      return res.status(400).json({ 
        message: 'Patient with this email already exists' 
      });
    }

    // Create patient
    const patient = new Patient({
      firstName,
      lastName,
      email,
      password,
      phone
    });

    await patient.save();

    // Generate token
    const token = generateToken(patient._id, patient.email, patient.role);

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      token,
      patient: {
        id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        role: patient.role
      }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @route   POST /api/patients/login
// @desc    Login patient
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Please provide email and password' 
      });
    }

    // Check if patient exists
    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Check if patient is active
    if (!patient.isActive) {
      return res.status(401).json({ 
        message: 'Account is deactivated. Please contact administrator.' 
      });
    }

    // Validate password
    const isPasswordMatch = await patient.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = generateToken(patient._id, patient.email, patient.role);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      patient: {
        id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        role: patient.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   GET /api/patients/profile
// @desc    Get patient profile
// @access  Private
router.get('/profile', authenticate, authorize('patient'), async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id).select('-password');
    
    if (!patient) {
      return res.status(404).json({ 
        message: 'Patient not found' 
      });
    }

    res.json({
      success: true,
      patient
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/patients/profile
// @desc    Update patient profile
// @access  Private
router.put('/profile', authenticate, authorize('patient'), async (req, res) => {
  try {
    const allowedUpdates = [
      'firstName', 
      'lastName', 
      'phone'
    ];
    
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    const patient = await Patient.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      patient
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;