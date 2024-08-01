'use client';

import { useState, ChangeEvent } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter } from 'next/navigation';
import backgroundImage from '../blue.jpg';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const router = useRouter();

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/request-password-reset/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email}),
      });
      const data = await response.json()
      console.log(data)
      if (response.status === 200) {
        setSuccess(true);
        localStorage.setItem('email',email)
        router.push('/verify-code');
      }
      else{
        setError(data.error)
      }
      
    } catch (err) {
      if (err.response && err.response.data) {
      setError(err.response.data.error || 'An error occurred');
    } else {
      setError('An error occurred');
    }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container">
      <div className="form-container">
        <h1>Forgot Password</h1>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">A 4-digit code has been sent to your email</p>}
        {!success && (
          <>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter your email"
                aria-label="Email"
              />
            </div>
            <button onClick={handleResetPassword} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Reset Password'}
            </button>
          </>
        )}
      </div>
      <style jsx>{`
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          min-height: 100vh;
          min-width: 100vw;
          background-image: url(${backgroundImage.src});
          background-size: cover;
          background-position: center;
          font-family: 'Roboto', sans-serif;
          position: relative;
          overflow: hidden;
        }
        .form-container {
          max-width: 400px;
          width: 100%;
          padding: 2rem;
          background: #fff;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }
        h1 {
          margin-bottom: 2rem;
          font-size: 2rem;
          text-align: center;
        }
        .error-message {
          color: red;
          margin-bottom: 1rem;
          text-align: center;
        }
        .success-message {
          color: green;
          margin-bottom: 1rem;
          text-align: center;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
        }
        input {
          width: 100%;
          padding: 0.5rem;
          font-size: 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        button {
          width: 100%;
          padding: 0.75rem;
          font-size: 1rem;
          background: #0070f3;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        button:hover:enabled {
          background: #005bb5;
        }
      `}</style>
    </div>
  );
}