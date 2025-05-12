//PayPal Button
import React from 'react';

const PayPalButton = ({ amount }) => {
  const isValidAmount = amount && !isNaN(amount) && Number(amount) > 0;

  return (
    <div>
      <h3>Pay with PayPal</h3>
      {!isValidAmount ? (
        <p style={{ color: 'red' }}>Invalid payment amount.</p>
      ) : (
        <form action="/api/payments/paypal" method="POST">
          <input type="hidden" name="amount" value={amount} />
          <button type="submit">Checkout with PayPal</button>
        </form>
      )}
    </div>
  );
};

export default PayPalButton;
