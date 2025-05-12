// CalendarView component
import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { fetchCalendarEvents } from '../../services/calendarService';

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');


  useEffect(() => {
    const load = async () => {
      try {
      const res = await fetchCalendarEvents();
      if (res.length === 0) {
        setError('No events available to display.');
      } else {
        setError(''); // Clear error message if events are found
        setEvents(res);
      }
    } catch (err) {
      setError('Failed to load calendar events. Please try again later.'); // Error message for failed fetch
    }

    };
    load();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h3>Shared Calendar</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events.map(evt => ({
          title: evt.title,
          date: evt.date,
        }))}
      />
    </div>
  );
};

export default CalendarView;
