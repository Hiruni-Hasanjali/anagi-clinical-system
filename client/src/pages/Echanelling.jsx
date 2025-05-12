// pages/Echanelling.jsx
import React, { useEffect, useState } from 'react';
import { apiClient } from '../config/api';
import './Echanelling.css';
import PaymentGateway from '../components/PaymentGateway';

const Echanelling = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [doctorRatings, setDoctorRatings] = useState({});
  const [doctorReviews, setDoctorReviews] = useState({});
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [selectedDoctorReviews, setSelectedDoctorReviews] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Fetch available doctors on component mount
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await apiClient.get('/api/appointments/available-doctors');
      setDoctors(response.data.doctors);
      // Fetch ratings for all doctors
      await fetchDoctorRatings(response.data.doctors);
    } catch (err) {
      setError('Failed to fetch doctors');
    }
  };

  const fetchDoctorRatings = async (doctors) => {
    const ratings = {};
    const reviews = {};
    
    for (const doctor of doctors) {
      try {
        const response = await apiClient.get(`/api/feedback/doctor/${doctor._id}`);
        ratings[doctor._id] = {
          averageRating: parseFloat(response.data.averageRating) || 0,
          totalFeedbacks: parseInt(response.data.totalFeedbacks) || 0
        };
        reviews[doctor._id] = response.data.feedbacks || [];
      } catch (err) {
        console.error(`Failed to fetch rating for doctor ${doctor._id}`);
        ratings[doctor._id] = { averageRating: 0, totalFeedbacks: 0 };
        reviews[doctor._id] = [];
      }
    }
    
    setDoctorRatings(ratings);
    setDoctorReviews(reviews);
  };

  // Fetch available slots when doctor and date are selected
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const fetchAvailableSlots = async () => {
    try {
      const response = await apiClient.get(
        `/api/appointments/doctor/${selectedDoctor._id}/slots?date=${selectedDate}`
      );
      setAvailableSlots(response.data.availableSlots);
      setSelectedSlot(''); // Reset selected slot
    } catch (err) {
      setError('Failed to fetch available slots');
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate required fields
    if (!selectedDoctor || !selectedDate || !selectedSlot || !reason.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Show payment modal instead of booking directly
    setShowPaymentModal(true);
  };
  
  const handlePaymentSuccess = async () => {
    setLoading(true);
    
    try {
      const response = await apiClient.post('/api/appointments/book', {
        doctorId: selectedDoctor._id,
        date: selectedDate,
        timeSlot: selectedSlot,
        reason: reason
      });

      setShowPaymentModal(false);
      setSuccess('Payment successful. Appointment booked!');
      
      // Reset form
      setSelectedDoctor(null);
      setSelectedDate('');
      setSelectedSlot('');
      setReason('');
      setAvailableSlots([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
      setShowPaymentModal(false);
    } finally {
      setLoading(false);
    }
  };

  const openReviewsModal = (doctorId) => {
    setSelectedDoctorReviews({
      doctor: doctors.find(d => d._id === doctorId),
      reviews: doctorReviews[doctorId] || [],
      rating: doctorRatings[doctorId] || { averageRating: 0, totalFeedbacks: 0 }
    });
    setShowReviewsModal(true);
  };

  // Get tomorrow's date as minimum selectable date
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    return (
      <div className="stars">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="star-full">★</span>
        ))}
        {hasHalfStar && <span className="star-full">★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="star-empty">☆</span>
        ))}
      </div>
    );
  };

  return (
    <div className="echanelling-container">
      <h2 className="echanelling-title">E-Channelling - Book Your Appointment</h2>
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <form onSubmit={handleBookAppointment} className="echanelling-form">
        {/* Step 1: Select Doctor */}
        <div className="form-section">
          <label className="step-label">
            Step 1: Select a Doctor
          </label>
          <div className="doctors-grid">
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                className={`doctor-card ${selectedDoctor?._id === doctor._id ? 'selected' : ''}`}
                onClick={() => setSelectedDoctor(doctor)}
              >
                {/* Doctor Card Content */}
                <div className="doctor-content">
                  {/* Doctor Info */}
                  <div className="doctor-info">
                    <div className="doctor-header">
                      <div>
                        <h3 className="doctor-name">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </h3>
                        <p className="doctor-specialization">{doctor.specialization}</p>
                        
                        {/* Rating */}
                        <div className="rating-container">
                          {renderStars(doctorRatings[doctor._id]?.averageRating || 0)}
                          <span className="rating-value">
                            {(doctorRatings[doctor._id]?.averageRating || 0).toFixed(1)}
                          </span>
                          <span className="rating-count">
                            ({doctorRatings[doctor._id]?.totalFeedbacks || 0} reviews)
                          </span>
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="price-container">
                        <p className="price-amount">Rs. {doctor.consultationFee}</p>
                        <p className="price-label">Per Session</p>
                      </div>
                    </div>

                    {/* Available Days */}
                    <div className="available-days">
                      <p className="available-days-label">Available Days:</p>
                      <div className="days-container">
                        {doctor.availableSlots.map(slot => (
                          <span key={slot.day} className="day-badge">
                            {slot.day.substring(0, 3)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* View Reviews Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openReviewsModal(doctor._id);
                      }}
                      className="reviews-button"
                    >
                      View All Reviews
                    </button>
                  </div>
                </div>

                {/* Selected Indicator */}
                {selectedDoctor?._id === doctor._id && (
                  <div className="selected-indicator">
                    ✓ Selected
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Select Date */}
        {selectedDoctor && (
          <div className="form-section">
            <label className="step-label">
              Step 2: Select Date
            </label>
            <input
              type="date"
              min={getTomorrowDate()}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-input"
              required
            />
          </div>
        )}

        {/* Step 3: Select Time Slot */}
        {selectedDate && availableSlots.length > 0 && (
          <div className="form-section">
            <label className="step-label">
              Step 3: Select Time Slot
            </label>
            <div className="time-slots-grid">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`time-slot-button ${selectedSlot === slot ? 'selected' : ''}`}
                  onClick={() => setSelectedSlot(slot)}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedDate && availableSlots.length === 0 && (
          <div className="alert alert-error">
            No available slots for this date. Please select another date.
          </div>
        )}

        {/* Step 4: Add Reason */}
        {selectedSlot && (
          <div className="form-section">
            <label className="step-label">
              Step 4: Reason for Visit
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="reason-textarea"
              rows="3"
              placeholder="Please describe your symptoms or reason for visit"
              required
            />
          </div>
        )}

        {/* Submit Button */}
        {selectedSlot && reason && (
          <div className="form-section">
            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        )}

        {/* Appointment Summary */}
        {selectedDoctor && selectedDate && selectedSlot && (
          <div className="appointment-summary">
            <h3>Appointment Summary:</h3>
            <p><strong>Doctor:</strong> Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</p>
            <p><strong>Specialization:</strong> {selectedDoctor.specialization}</p>
            <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {selectedSlot}</p>
            <p><strong>Consultation Fee:</strong> Rs. {selectedDoctor.consultationFee}</p>
          </div>
        )}
      </form>

      {/* Reviews Modal */}
      {showReviewsModal && selectedDoctorReviews && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h2 className="modal-title">
                  Reviews for Dr. {selectedDoctorReviews.doctor.firstName} {selectedDoctorReviews.doctor.lastName}
                </h2>
                <div className="modal-rating">
                  {renderStars(selectedDoctorReviews.rating.averageRating || 0)}
                  <span className="rating-value">
                    {(selectedDoctorReviews.rating.averageRating || 0).toFixed(1)} out of 5
                  </span>
                  <span className="rating-count">
                    ({selectedDoctorReviews.rating.totalFeedbacks || 0} reviews)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowReviewsModal(false)}
                className="modal-close"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              {selectedDoctorReviews.reviews.length > 0 ? (
                <div className="reviews-list">
                  {selectedDoctorReviews.reviews.map((review) => (
                    <div key={review._id} className="review-item">
                      <div className="review-header">
                        <div className="review-info">
                          <span className="review-stars">
                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                          </span>
                          <span className="review-author">{review.patient.firstName} {review.patient.lastName}</span>
                        </div>
                        <span className="review-date">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="review-comment">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-reviews">No reviews yet for this doctor.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      {showPaymentModal && selectedDoctor && (
        <PaymentGateway
          amount={selectedDoctor.consultationFee}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default Echanelling;