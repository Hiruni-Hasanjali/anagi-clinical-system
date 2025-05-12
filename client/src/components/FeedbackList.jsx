//Feedback List
import React, { useEffect, useState } from 'react';
import { fetchFeedbacks } from '../../services/feedbackService';

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchFeedbacks();
        
        if (!res || res.length === 0) {
          setError('No feedbacks available.');
          return;
        }

        setFeedbacks(res);
        setError('');
      } catch (err) {
        setError('Failed to load feedbacks. Please try again later.');
      }
    };

    load();
  }, []);

  return (
    <div>
      <h3>Patient Reviews</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {feedbacks.length > 0 ? (
        feedbacks.map((fb, index) => (
          <div key={index}>
            <strong>{fb.user}</strong> ({fb.rating}★): {fb.comment}
          </div>
        )) 
      ) : (
        <p>No feedbacks to display.</p>
      )}
    </div>
  );
};

export default FeedbackList;

