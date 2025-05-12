// routes/invoiceRoutes.js
const express = require('express');
const Invoice = require('../models/Invoice');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get all invoices (filtered by user role)
router.get('/', authenticate, async (req, res) => {
  try {
    let invoices;
    
    if (req.user.role === 'doctor') {
      invoices = await Invoice.find({ doctor: req.user.id })
        .populate('patient', 'firstName lastName email phone')
        .populate('appointment', 'date timeSlot')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'patient') {
      invoices = await Invoice.find({ patient: req.user.id })
        .populate('doctor', 'firstName lastName specialization')
        .populate('appointment', 'date timeSlot')
        .sort({ createdAt: -1 });
    }
    
    res.json({
      success: true,
      invoices
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Get single invoice
router.get('/:id', authenticate, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization licenseNumber')
      .populate('appointment', 'date timeSlot reason');
    
    if (!invoice) {
      return res.status(404).json({ 
        success: false,
        message: 'Invoice not found' 
      });
    }
    
    // Check authorization
    if (req.user.role === 'doctor' && invoice.doctor._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }
    
    if (req.user.role === 'patient' && invoice.patient._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }
    
    res.json({
      success: true,
      invoice
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;