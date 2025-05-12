// components/PaymentGateway.jsx
import React, { useState } from 'react';
import './PaymentGateway.css';

const PaymentGateway = ({ amount, onClose, onSuccess }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const formatCardNumber = (value) => {
    const input = value.replace(/\D/g, '');
    const formatted = input.substring(0, 16).match(/.{1,4}/g)?.join(' ') || '';
    setCardNumber(formatted);
  };

  const formatExpiry = (value) => {
    const input = value.replace(/\D/g, '');
    if (input.length <= 2) {
      setExpiry(input);
    } else {
      setExpiry(`${input.substring(0, 2)}/${input.substring(2, 4)}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate card information
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Please enter a valid card number');
      return;
    }
    if (!cardHolder.trim()) {
      setError('Please enter the card holder name');
      return;
    }
    if (!expiry.match(/^\d{2}\/\d{2}$/)) {
      setError('Please enter a valid expiry date (MM/YY)');
      return;
    }
    if (cvv.length !== 3) {
      setError('Please enter a valid CVV');
      return;
    }
    
    // Process payment
    setError('');
    setIsProcessing(true);
    
    // Simulate payment processing (would connect to a real payment gateway in production)
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 2000);
  };

  return (
    <div className="payment-overlay">
      <div className="payment-modal">
        <div className="payment-header">
          <h2>Credit/Debit Card Payment</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="payment-amount">
          <p>Amount to Pay</p>
          <h3>Rs. {amount.toFixed(2)}</h3>
        </div>
        
        {error && <div className="payment-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="payment-form">
          <div className="payment-form-content">
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => formatCardNumber(e.target.value)}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
            </div>
            <div className="form-group">
              <label>Card Holder Name</label>
              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="form-row">
              <div className="form-group half">
                <label>Expiry Date</label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => formatExpiry(e.target.value)}
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>
              <div className="form-group half">
                <label>CVV</label>
                <input
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                  placeholder="123"
                  maxLength={3}
                />
              </div>
            </div>
          </div>
          
          <button type="submit" className="payment-button" disabled={isProcessing}>
            {isProcessing ? (
              <div className="processing">
                <div className="spinner"></div>
                <span>Processing...</span>
              </div>
            ) : (
              `Pay Rs. ${amount.toFixed(2)}`
            )}
          </button>
        </form>
        
        <div className="payment-footer">
          <div className="security-info">
            <span className="lock-icon">🔒</span>
            <span>Secured by SSL Encryption</span>
          </div>
          <div className="payment-methods-icons">
            <span className="method-icon">Visa</span>
            <span className="method-icon">MC</span>
            <span className="method-icon">Amex</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;