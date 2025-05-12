// components/PrescriptionForm.jsx
import React, { useState } from 'react';
import { apiClient } from '../config/api';

const PrescriptionForm = ({ appointment, onSubmit }) => {
  const [medications, setMedications] = useState([{ 
    name: '', 
    dosage: '', 
    frequency: '', 
    duration: '', 
    instructions: '' 
  }]);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddMedication = () => {
    setMedications([...medications, { 
      name: '', 
      dosage: '', 
      frequency: '', 
      duration: '', 
      instructions: '' 
    }]);
  };

  const handleRemoveMedication = (index) => {
    const updatedMedications = [...medications];
    updatedMedications.splice(index, 1);
    setMedications(updatedMedications);
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...medications];
    updatedMedications[index][field] = value;
    setMedications(updatedMedications);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/api/prescriptions', {
        patientId: appointment.patient._id,
        appointmentId: appointment._id,
        medications,
        diagnosis,
        notes
      });

      setLoading(false);
      if (onSubmit) {
        onSubmit(response.data.prescription);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create prescription');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Create Prescription</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Diagnosis
        </label>
        <textarea
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          rows="2"
          placeholder="Enter diagnosis"
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Medications
        </label>
        
        {medications.map((medication, index) => (
          <div key={index} className="p-4 mb-4 border rounded">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-gray-700 text-sm mb-1">Medication Name</label>
                <input
                  type="text"
                  value={medication.name}
                  onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Medicine name"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1">Dosage</label>
                <input
                  type="text"
                  value={medication.dosage}
                  onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="e.g., 500mg"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-gray-700 text-sm mb-1">Frequency</label>
                <input
                  type="text"
                  value={medication.frequency}
                  onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="e.g., Twice daily"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1">Duration</label>
                <input
                  type="text"
                  value={medication.duration}
                  onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="e.g., 7 days"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm mb-1">Instructions</label>
              <input
                type="text"
                value={medication.instructions}
                onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="e.g., Take after meals"
              />
            </div>
            
            {medications.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveMedication(index)}
                className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        
        <button
          type="button"
          onClick={handleAddMedication}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Medication
        </button>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Additional Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          rows="3"
          placeholder="Enter additional notes or instructions"
        />
      </div>
      
      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {loading ? 'Creating...' : 'Create Prescription'}
        </button>
      </div>
    </form>
  );
};

export default PrescriptionForm;