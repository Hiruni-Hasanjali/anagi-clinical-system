// routes/feedbackRoutes.js
const express = require('express');
const Feedback = require('../models/Feedback');
const Appointment = require('../models/Appointment');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/feedback
// @desc    Submit feedback for an appointment
// @access  Private (Patient only)
router.post('/', authenticate, authorize('patient'), async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;
    
    // Find appointment
    const appointment = await Appointment.findById(appointmentId)
      .populate('doctor');
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: 'Appointment not found' 
      });
    }
    
    // Check if appointment belongs to this patient
    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }
    
    // Check if appointment is completed
    if (appointment.status !== 'completed') {
      return res.status(400).json({ 
        success: false,
        message: 'Can only provide feedback for completed appointments' 
      });
    }
    
    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({ appointment: appointmentId });
    if (existingFeedback) {
      return res.status(400).json({ 
        success: false,
        message: 'Feedback already provided for this appointment' 
      });
    }
    
    // Create feedback
    const feedback = new Feedback({
      appointment: appointmentId,
      patient: req.user.id,
      doctor: appointment.doctor._id,
      rating,
      comment
    });
    
    await feedback.save();
    
    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @route   GET /api/feedback/doctor/:doctorId
// @desc    Get all feedback for a doctor
// @access  Public
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ doctor: req.params.doctorId })
      .populate('patient', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    // Calculate average rating
    const totalRating = feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
    const averageRating = feedbacks.length > 0 ? (totalRating / feedbacks.length).toFixed(1) : 0;
    
    res.json({
      success: true,
      feedbacks,
      averageRating,
      totalFeedbacks: feedbacks.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   GET /api/feedback/appointment/:appointmentId
// @desc    Check if feedback exists for an appointment
// @access  Private
router.get('/appointment/:appointmentId', authenticate, async (req, res) => {
  try {
    const feedback = await Feedback.findOne({ appointment: req.params.appointmentId });
    
    res.json({
      success: true,
      hasFeedback: !!feedback,
      feedback
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

module.exports = router;