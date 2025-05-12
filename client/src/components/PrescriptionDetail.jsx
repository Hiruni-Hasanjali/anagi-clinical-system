// components/PrescriptionDetail.jsx
import React from 'react';
import jsPDF from 'jspdf';

const PrescriptionDetail = ({ prescription }) => {
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('MEDICAL PRESCRIPTION', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    
    // Doctor Info
    if (prescription.doctor) {
      doc.text('Doctor:', 20, 40);
      doc.text(`Dr. ${prescription.doctor.firstName || ''} ${prescription.doctor.lastName || ''}`, 50, 40);
      doc.text(`Specialization: ${prescription.doctor.specialization || 'N/A'}`, 20, 50);
    }
    
    // Patient Info
    if (prescription.patient) {
      doc.text('Patient:', 20, 70);
      doc.text(`${prescription.patient.firstName || ''} ${prescription.patient.lastName || ''}`, 50, 70);
    }
    
    // Prescription Date
    doc.text(`Date: ${new Date(prescription.createdAt).toLocaleDateString()}`, 20, 90);
    
    // Diagnosis
    doc.text('Diagnosis:', 20, 110);
    doc.text(prescription.diagnosis || 'N/A', 70, 110);
    
    // Medications
    doc.text('Medications:', 20, 130);
    let yPos = 140;
    
    prescription.medications.forEach((med, index) => {
      doc.text(`${index + 1}. ${med.name} - ${med.dosage}`, 30, yPos);
      yPos += 10;
      doc.text(`   Frequency: ${med.frequency}`, 30, yPos);
      yPos += 10;
      doc.text(`   Duration: ${med.duration}`, 30, yPos);
      yPos += 10;
      if (med.instructions) {
        doc.text(`   Instructions: ${med.instructions}`, 30, yPos);
        yPos += 10;
      }
      yPos += 5;
    });
    
    // Notes
    if (prescription.notes) {
      doc.text('Additional Notes:', 20, yPos);
      yPos += 10;
      doc.text(prescription.notes, 30, yPos);
    }
    
    // Doctor's signature
    yPos += 30;
    doc.text('Doctor\'s Signature:', 20, yPos);
    
    doc.save(`Prescription_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Prescription Details</h2>
        <button
          onClick={exportToPDF}
          className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Download PDF
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">Doctor:</p>
          <p className="text-lg font-medium">
            Dr. {prescription.doctor?.firstName} {prescription.doctor?.lastName}
          </p>
          <p className="text-gray-600">{prescription.doctor?.specialization}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Patient:</p>
          <p className="text-lg font-medium">
            {prescription.patient?.firstName} {prescription.patient?.lastName}
          </p>
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">Date:</p>
        <p className="text-gray-700">
          {new Date(prescription.createdAt).toLocaleDateString()}
        </p>
      </div>
      
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">Diagnosis:</p>
        <p className="text-gray-700">{prescription.diagnosis}</p>
      </div>
      
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-1">Medications:</p>
        <div className="space-y-4 mt-2">
          {prescription.medications.map((med, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded">
              <div className="flex justify-between">
                <p className="font-medium">{med.name}</p>
                <p>{med.dosage}</p>
              </div>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                <p className="text-gray-600"><span className="font-medium">Frequency:</span> {med.frequency}</p>
                <p className="text-gray-600"><span className="font-medium">Duration:</span> {med.duration}</p>
              </div>
              {med.instructions && (
                <p className="text-gray-600 mt-2"><span className="font-medium">Instructions:</span> {med.instructions}</p>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {prescription.notes && (
        <div>
          <p className="text-sm text-gray-500 mb-1">Additional Notes:</p>
          <p className="text-gray-700 whitespace-pre-line">{prescription.notes}</p>
        </div>
      )}
      
      <div className="mt-6 pt-6 border-t">
        <p className="text-sm text-gray-500">Status:</p>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          prescription.status === 'active' ? 'bg-green-100 text-green-800' :
          prescription.status === 'completed' ? 'bg-blue-100 text-blue-800' :
          'bg-red-100 text-red-800'
        }`}>
          {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
        </span>
      </div>
    </div>
  );
};

export default PrescriptionDetail;