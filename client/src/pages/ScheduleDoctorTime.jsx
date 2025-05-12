// pages/ScheduleDoctorTime.jsx
import React, { useState, useEffect } from 'react';
import { apiClient } from '../config/api';

const ScheduleDoctorTime = () => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchCurrentSchedule();
  }, []);

  const fetchCurrentSchedule = async () => {
    try {
      const response = await apiClient.get('/api/doctors/profile');
      setAvailableSlots(response.data.doctor.availableSlots || []);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const handleAddSlot = () => {
    setAvailableSlots([...availableSlots, {
      day: 'Monday',
      startTime: '09:00',
      endTime: '17:00',
      maxPatients: 20
    }]);
  };

  const handleRemoveSlot = (index) => {
    const newSlots = availableSlots.filter((_, i) => i !== index);
    setAvailableSlots(newSlots);
  };

  const handleSlotChange = (index, field, value) => {
    const newSlots = [...availableSlots];
    newSlots[index][field] = value;
    setAvailableSlots(newSlots);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.put('/api/doctors/schedule', { availableSlots });
      setMessage('Schedule updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Manage Your Schedule</h2>
      
      {message && (
        <div className={`p-4 mb-4 rounded ${
          message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8">
        <div className="mb-4">
          <button
            type="button"
            onClick={handleAddSlot}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Time Slot
          </button>
        </div>

        {availableSlots.map((slot, index) => (
          <div key={index} className="mb-4 p-4 border rounded">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Day</label>
                <select
                  value={slot.day}
                  onChange={(e) => handleSlotChange(index, 'day', e.target.value)}
                  className="shadow border rounded w-full py-2 px-3"
                >
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Start Time</label>
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)}
                  className="shadow border rounded w-full py-2 px-3"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">End Time</label>
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)}
                  className="shadow border rounded w-full py-2 px-3"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Max Patients</label>
                <input
                  type="number"
                  value={slot.maxPatients}
                  onChange={(e) => handleSlotChange(index, 'maxPatients', parseInt(e.target.value))}
                  className="shadow border rounded w-full py-2 px-3"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleRemoveSlot(index)}
              className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
            >
              Remove
            </button>
          </div>
        ))}

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleDoctorTime;