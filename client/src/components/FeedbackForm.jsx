//Feedback Form
import React, { useState } from 'react';
import { submitFeedback } from '../../services/feedbackService';

const FeedbackForm = () => {
  const [feedback, setFeedback] = useState({
    user: '',
    rating: 5,
    comment: '',
  });

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (feedback.user.trim() === '' || feedback.comment.trim() === '') {
      setError('Name and comment are required.');
      return;
    }
    if (feedback.rating < 1 || feedback.rating > 5) {
      setError('Rating must be between 1 and 5.');
      return;
    }
    setError('');

    await submitFeedback(feedback);
    alert('Feedback submitted');
    setFeedback({ user: '', rating: 5, comment: '' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Leave a Review</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <input placeholder="Your Name" value={feedback.user} onChange={e => setFeedback({ ...feedback, user: e.target.value })} required />
      <select value={feedback.rating} onChange={e => setFeedback({ ...feedback, rating: e.target.value })}>
        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
      </select>
      <textarea placeholder="Your Comment" value={feedback.comment} onChange={e => setFeedback({ ...feedback, comment: e.target.value })} required />
      <button type="submit">Submit</button>
    </form>
  );
};

export default FeedbackForm;