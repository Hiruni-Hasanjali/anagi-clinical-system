// routes/prescriptionRoutes.js
const express = require('express');
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Create a new prescription
router.post('/', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { patientId, appointmentId, medications, notes, diagnosis } = req.body;
    
    // Check if appointment exists and belongs to this doctor
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({ 
          success: false,
          message: 'Appointment not found' 
        });
      }
      
      if (appointment.doctor.toString() !== req.user.id) {
        return res.status(403).json({ 
          success: false,
          message: 'Not authorized' 
        });
      }
    }
    
    const prescription = new Prescription({
      patient: patientId,
      doctor: req.user.id,
      appointment: appointmentId || null,
      medications,
      notes,
      diagnosis
    });
    
    await prescription.save();
    
    // Populate doctor and patient info
    await prescription.populate('doctor', 'firstName lastName specialization');
    await prescription.populate('patient', 'firstName lastName');
    
    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      prescription
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Get prescriptions based on user role
router.get('/my-prescriptions', authenticate, async (req, res) => {
  try {
    let prescriptions;
    
    if (req.user.role === 'doctor') {
      prescriptions = await Prescription.find({ doctor: req.user.id })
        .populate('patient', 'firstName lastName email')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'patient') {
      prescriptions = await Prescription.find({ patient: req.user.id })
        .populate('doctor', 'firstName lastName specialization')
        .sort({ createdAt: -1 });
    }
    
    res.json({
      success: true,
      prescriptions
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Get a specific prescription
router.get('/:id', authenticate, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName specialization licenseNumber')
      .populate('appointment', 'date timeSlot');
    
    if (!prescription) {
      return res.status(404).json({ 
        success: false,
        message: 'Prescription not found' 
      });
    }
    
    // Check authorization
    if (req.user.role === 'doctor' && prescription.doctor._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }
    
    if (req.user.role === 'patient' && prescription.patient._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }
    
    res.json({
      success: true,
      prescription
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Update a prescription (doctor only)
router.put('/:id', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { medications, notes, diagnosis, status } = req.body;
    
    const prescription = await Prescription.findById(req.params.id);
    
    if (!prescription) {
      return res.status(404).json({ 
        success: false,
        message: 'Prescription not found' 
      });
    }
    
    if (prescription.doctor.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }
    
    // Only allow updates if the prescription is still active
    if (prescription.status !== 'active' && !status) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot update a completed or cancelled prescription' 
      });
    }
    
    if (medications) prescription.medications = medications;
    if (notes) prescription.notes = notes;
    if (diagnosis) prescription.diagnosis = diagnosis;
    if (status) prescription.status = status;
    
    await prescription.save();
    
    res.json({
      success: true,
      message: 'Prescription updated successfully',
      prescription
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;