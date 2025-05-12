// routes/doctorRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const Invoice = require('../models/Invoice');
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

// @route   POST /api/doctors/register
// @desc    Register a new doctor
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      specialization,
      licenseNumber,
      phone,
      consultationFee
    } = req.body;

    // Check if doctor already exists
    const doctorExists = await Doctor.findOne({ 
      $or: [{ email }, { licenseNumber }] 
    });

    if (doctorExists) {
      return res.status(400).json({ 
        message: 'Doctor with this email or license number already exists' 
      });
    }

    // Create doctor
    const doctor = new Doctor({
      firstName,
      lastName,
      email,
      password,
      specialization,
      licenseNumber,
      phone,
      consultationFee
    });

    await doctor.save();

    // Generate token
    const token = generateToken(doctor._id, doctor.email, doctor.role);

    res.status(201).json({
      success: true,
      message: 'Doctor registered successfully',
      token,
      doctor: {
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        specialization: doctor.specialization,
        role: doctor.role
      }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @route   POST /api/doctors/login
// @desc    Login doctor
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

    // Check if doctor exists
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Check if doctor is active
    if (!doctor.isActive) {
      return res.status(401).json({ 
        message: 'Account is deactivated. Please contact administrator.' 
      });
    }

    // Validate password
    const isPasswordMatch = await doctor.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = generateToken(doctor._id, doctor.email, doctor.role);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      doctor: {
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        specialization: doctor.specialization,
        role: doctor.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   GET /api/doctors/profile
// @desc    Get doctor profile
// @access  Private
router.get('/profile', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.id).select('-password');
    
    if (!doctor) {
      return res.status(404).json({ 
        message: 'Doctor not found' 
      });
    }

    res.json({
      success: true,
      doctor
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/doctors/profile
// @desc    Update doctor profile
// @access  Private
router.put('/profile', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const allowedUpdates = [
      'firstName', 
      'lastName', 
      'phone', 
      'consultationFee'
    ];
    
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    const doctor = await Doctor.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      doctor
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @route   PUT /api/doctors/schedule
// @desc    Update doctor's available slots
// @access  Private
router.put('/schedule', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { availableSlots } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      req.user.id,
      { availableSlots },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Schedule updated successfully',
      availableSlots: doctor.availableSlots
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
});

router.get('/income-summary', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    // Get all invoices for this doctor
    const invoices = await Invoice.find({ doctor: doctorId });
    
    // Calculate totals
    const totalIncome = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paidIncome = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    const pendingIncome = invoices
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    
    // Current month income
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const monthlyInvoices = invoices.filter(inv => 
      new Date(inv.date) >= currentMonth
    );
    const monthlyIncome = monthlyInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    
    // Today's income
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.date);
      invDate.setHours(0, 0, 0, 0);
      return invDate.getTime() === today.getTime();
    });
    const todayIncome = todayInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    
    res.json({
      success: true,
      summary: {
        totalIncome,
        paidIncome,
        pendingIncome,
        monthlyIncome,
        todayIncome,
        totalInvoices: invoices.length,
        paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
        pendingInvoices: invoices.filter(inv => inv.status === 'pending').length
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

module.exports = router;