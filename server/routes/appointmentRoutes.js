// routes/appointmentRoutes.js
const express = require('express');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Invoice = require('../models/Invoice');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/appointments/available-doctors
// @desc    Get all doctors with their available slots
// @access  Public
router.get('/available-doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true })
      .select('firstName lastName specialization consultationFee availableSlots');
    
    res.json({
      success: true,
      doctors
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   POST /api/appointments/book
// @desc    Book an appointment
// @access  Private (Patient only)
router.post('/book', authenticate, authorize('patient'), async (req, res) => {
  try {
    const { doctorId, date, timeSlot, reason } = req.body;
    
    // Find doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ 
        success: false,
        message: 'Doctor not found' 
      });
    }
    
    // Check if the time slot is available
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      timeSlot
    });
    
    if (existingAppointment) {
      return res.status(400).json({ 
        success: false,
        message: 'This time slot is already booked' 
      });
    }
    
    // Create appointment
    const appointment = new Appointment({
      patient: req.user.id,
      doctor: doctorId,
      date: new Date(date),
      timeSlot,
      reason,
      fee: doctor.consultationFee
    });
    
    await appointment.save();
    
    // Populate patient and doctor info
    await appointment.populate('patient', 'firstName lastName email phone');
    await appointment.populate('doctor', 'firstName lastName specialization');
    
    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @route   GET /api/appointments/my-appointments
// @desc    Get appointments based on user role
// @access  Private
router.get('/my-appointments', authenticate, async (req, res) => {
  try {
    let appointments;
    
    if (req.user.role === 'patient') {
      appointments = await Appointment.find({ patient: req.user.id })
        .populate('doctor', 'firstName lastName specialization')
        .sort({ date: -1 });
    } else if (req.user.role === 'doctor') {
      appointments = await Appointment.find({ doctor: req.user.id })
        .populate('patient', 'firstName lastName email phone')
        .sort({ date: -1 });
    }
    
    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/appointments/:id/cancel
// @desc    Cancel an appointment
// @access  Private
router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: 'Appointment not found' 
      });
    }
    
    // Check if user is authorized to cancel
    if (req.user.role === 'patient' && appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }
    
    if (req.user.role === 'doctor' && appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }
    
    appointment.status = 'cancelled';
    await appointment.save();
    
    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   GET /api/appointments/doctor/:doctorId/slots
// @desc    Get available time slots for a specific doctor on a specific date
// @access  Public
router.get('/doctor/:doctorId/slots', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ 
        success: false,
        message: 'Date is required' 
      });
    }
    
    // Find doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ 
        success: false,
        message: 'Doctor not found' 
      });
    }
    
    // Get day of week
    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Find available slots for that day
    const daySlots = doctor.availableSlots.find(slot => slot.day === dayOfWeek);
    
    if (!daySlots) {
      return res.json({
        success: true,
        availableSlots: []
      });
    }
    
    // Generate time slots (30-minute intervals)
    const startTime = new Date(`2000-01-01 ${daySlots.startTime}`);
    const endTime = new Date(`2000-01-01 ${daySlots.endTime}`);
    const slots = [];
    
    while (startTime < endTime) {
      const slotStart = startTime.toTimeString().slice(0, 5);
      startTime.setMinutes(startTime.getMinutes() + 30);
      const slotEnd = startTime.toTimeString().slice(0, 5);
      
      slots.push(`${slotStart}-${slotEnd}`);
    }
    
    // Get booked slots for that date
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      date: appointmentDate,
      status: { $ne: 'cancelled' }
    }).select('timeSlot');
    
    const bookedSlots = bookedAppointments.map(apt => apt.timeSlot);
    
    // Filter out booked slots
    const availableSlots = slots.filter(slot => !bookedSlots.includes(slot));
    
    res.json({
      success: true,
      availableSlots
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

router.put('/:id/status', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient')
      .populate('doctor');
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        message: 'Appointment not found' 
      });
    }
    
    if (appointment.doctor._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }
    
    appointment.status = status;
    await appointment.save();
    
    // If status is completed, generate invoice
    if (status === 'completed') {
      // Generate invoice number
      const invoiceCount = await Invoice.countDocuments();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(5, '0')}`;
      
      // Create invoice with proper references
      const invoice = new Invoice({
        appointment: appointment._id,
        patient: appointment.patient._id,
        doctor: appointment.doctor._id,
        invoiceNumber: invoiceNumber,
        date: new Date(),
        services: [{
          description: `Consultation - ${appointment.reason}`,
          cost: appointment.fee || 0
        }],
        totalAmount: appointment.fee || 0,
        status: 'pending'
      });
      
      await invoice.save();
      console.log('Invoice created:', invoice._id);
    }
    
    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;