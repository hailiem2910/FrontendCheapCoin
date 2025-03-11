import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OTPVerification = ({ email }) => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/verifyOtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Redirect to login page after successful verification
      navigate('/login', { 
        state: { message: 'Account verified successfully. Please login.' } 
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Verify Your Email</h2>
      <p className="auth-subtitle">
        We've sent a verification code to {email}
      </p>
      {error && (
        <div className="error-message">{error}</div>
      )}
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="otp">Enter Verification Code</label>
          <input
            type="text"
            id="otp"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) => {
              setError('');
              setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
            }}
            maxLength={6}
          />
        </div>
        <div className="timer">
          Time remaining: {formatTime(timer)}
        </div>
        <button 
          type="submit" 
          className="auth-button"
          disabled={loading || timer === 0}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>
    </div>
  );
};

export default OTPVerification;