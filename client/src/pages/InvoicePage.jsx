// pages/InvoicePage.jsx
import React, { useState, useEffect } from 'react';
import { apiClient } from '../config/api';
import jsPDF from 'jspdf';
import './InvoicePage.css';

function InvoicePage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await apiClient.get('/api/invoices');
      setInvoices(response.data.invoices);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch invoices');
      setLoading(false);
    }
  };

  const exportInvoiceToPDF = async (invoiceId) => {
    try {
      const response = await apiClient.get(`/api/invoices/${invoiceId}`);
      const invoice = response.data.invoice;
      
      if (!invoice) {
        throw new Error('Invoice data not found');
      }
      
      const doc = new jsPDF();
  
      // Header
      doc.setFontSize(20);
      doc.text('CLINIC INVOICE', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Invoice Number: ${invoice.invoiceNumber || 'N/A'}`, 20, 40);
      doc.text(`Date: ${invoice.date ? new Date(invoice.date).toLocaleDateString() : 'N/A'}`, 20, 50);
      
      // Doctor Info
      if (invoice.doctor) {
        doc.text('From:', 20, 70);
        doc.text(`Dr. ${invoice.doctor.firstName || ''} ${invoice.doctor.lastName || ''}`, 20, 80);
        doc.text(`${invoice.doctor.specialization || 'N/A'}`, 20, 90);
        doc.text(`License: ${invoice.doctor.licenseNumber || 'N/A'}`, 20, 100);
      }
      
      // Patient Info
      if (invoice.patient) {
        doc.text('To:', 120, 70);
        doc.text(`${invoice.patient.firstName || ''} ${invoice.patient.lastName || ''}`, 120, 80);
        doc.text(`${invoice.patient.email || 'N/A'}`, 120, 90);
        doc.text(`${invoice.patient.phone || 'N/A'}`, 120, 100);
      }
      
      // Appointment Details
      if (invoice.appointment) {
        doc.text('Appointment Details:', 20, 120);
        doc.text(`Date: ${invoice.appointment.date ? new Date(invoice.appointment.date).toLocaleDateString() : 'N/A'}`, 20, 130);
        doc.text(`Time: ${invoice.appointment.timeSlot || 'N/A'}`, 20, 140);
        doc.text(`Reason: ${invoice.appointment.reason || 'N/A'}`, 20, 150);
      }
      
      // Services section (without table)
      doc.text('Services:', 20, 170);
      let yPosition = 180;
      
      if (invoice.services && invoice.services.length > 0) {
        invoice.services.forEach((service) => {
          doc.text(`${service.description || 'N/A'}: Rs. ${service.cost ? service.cost.toFixed(2) : '0.00'}`, 20, yPosition);
          yPosition += 10;
        });
      } else {
        doc.text(`Consultation: Rs. ${invoice.totalAmount ? invoice.totalAmount.toFixed(2) : '0.00'}`, 20, yPosition);
        yPosition += 10;
      }
      
      // Total
      doc.setFontSize(14);
      doc.text(`Total Amount: Rs. ${invoice.totalAmount ? invoice.totalAmount.toFixed(2) : '0.00'}`, 20, yPosition + 20);
  
      doc.save(`Invoice_${invoice.invoiceNumber || 'undefined'}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert(`Failed to generate PDF: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading invoices...</div>;
  }

  if (error) {
    return <div className="error-state">Error: {error}</div>;
  }

  return (
    <div className="invoices-container">
      <h1 className="invoices-title">Invoices</h1>
      
      <div className="invoices-table-container">
        {invoices.length === 0 ? (
          <div className="empty-state">No invoices found</div>
        ) : (
          <div className="invoices-table-wrapper">
            <table className="invoices-table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Date</th>
                  <th>Patient</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(invoice => (
                  <tr key={invoice._id}>
                    <td>{invoice.invoiceNumber}</td>
                    <td>{new Date(invoice.date).toLocaleDateString()}</td>
                    <td>
                      {invoice.patient.firstName} {invoice.patient.lastName}
                    </td>
                    <td>Rs. {invoice.totalAmount.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${invoice.status}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => exportInvoiceToPDF(invoice._id)}
                        className="action-button btn-download"
                      >
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default InvoicePage;