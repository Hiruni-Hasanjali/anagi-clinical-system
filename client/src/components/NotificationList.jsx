//Notification List
import React, { useEffect, useState } from 'react';
import { getNotifications } from '../../services/notificationService';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        
        if (!data || data.length === 0) {
          setError('No notifications available');
          setNotifications([]);
          return;
        }

        setNotifications(data);
        setError('');
      } catch (err) {
        setError('Failed to fetch notifications. Please try again later.');
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="notification-list">
      <h3>Notifications</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {notifications.length === 0 ? (
          <li>No notifications available</li>
        ) : (
          notifications.map((n) => (
            <li key={n._id}>{n.message} <span style={{ fontSize: '0.8em', color: '#666' }}>({n.date})</span></li>
          ))
        )}
      </ul>
    </div>
  );
};

export default NotificationList;

